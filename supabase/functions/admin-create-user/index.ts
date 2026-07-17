import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CreateUserBody = {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  roleCode?: string;
  branchCodes?: string[];
};

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers:corsHeaders });
  if (request.method !== 'POST') return json({ ok:false, error:'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization');
  if (!supabaseUrl || !publishableKey || !serviceRoleKey || !authorization) return json({ ok:false, error:'Server configuration is incomplete.' }, 500);

  const callerClient = createClient(supabaseUrl, publishableKey, { global:{ headers:{ Authorization:authorization } } });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth:{ autoRefreshToken:false, persistSession:false } });
  const { data:{ user:caller }, error:callerError } = await callerClient.auth.getUser();
  if (callerError || !caller) return json({ ok:false, error:'Authentication required.' }, 401);

  const { data:canManage, error:accessError } = await callerClient.rpc('current_user_can', { p_module:'users-permissions', p_action:'create' });
  if (accessError || canManage !== true) return json({ ok:false, error:'Only an authorized Admin can create users.' }, 403);

  const body = await request.json() as CreateUserBody;
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.password || body.password.length < 8 || !body.name || !body.roleCode || !body.branchCodes?.length) return json({ ok:false, error:'Name, email, password, role and branch access are required.' }, 400);

  const { data:role, error:roleError } = await adminClient.from('roles').select('id, code').eq('code', body.roleCode).single();
  if (roleError || !role) return json({ ok:false, error:'The selected role does not exist.' }, 400);
  const { data:branches, error:branchError } = await adminClient.from('branches').select('id, code').in('code', body.branchCodes).eq('active', true);
  if (branchError || !branches || branches.length !== new Set(body.branchCodes).size) return json({ ok:false, error:'One or more selected branches are invalid.' }, 400);

  const { data:created, error:createError } = await adminClient.auth.admin.createUser({
    email,
    password:body.password,
    email_confirm:true,
    app_metadata:{ role:body.roleCode, branch_codes:body.branchCodes },
    user_metadata:{ display_name:body.name },
  });
  if (createError || !created.user) return json({ ok:false, error:createError?.message || 'Auth user creation failed.' }, 400);

  const branchIds = branches.map(branch => branch.id);
  const { error:profileError } = await adminClient.from('app_users').insert({ auth_user_id:created.user.id, name:body.name, phone:body.phone || null, email, role_id:role.id, branch_ids:branchIds, active:true });
  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ ok:false, error:profileError.message }, 400);
  }

  const { error:assignmentError } = await adminClient.from('user_branch_access').insert(branchIds.map(branchId => ({ auth_user_id:created.user.id, branch_id:branchId, assigned_by:caller.id })));
  if (assignmentError) return json({ ok:false, error:assignmentError.message }, 400);

  await adminClient.from('audit_log').insert({ auth_actor_id:caller.id, module:'users-permissions', action:'create', entity_type:'auth_user', entity_id:created.user.id, after_data:{ email, role:body.roleCode, branch_codes:body.branchCodes } });
  return json({ ok:true, userId:created.user.id }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers:{ ...corsHeaders, 'Content-Type':'application/json' } });
}
