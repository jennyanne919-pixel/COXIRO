-- Perfil de proveedor para la cuenta de administrador (valenzuelavet14+admin),
-- para poder probar el panel de proveedor con la misma cuenta ("Ver como").
-- Es una cuenta de pruebas: no tiene Stripe conectado ni cobra nada.
insert into providers (user_id, business_name, legal_type, legal_name, slug, referral_code, kyc_status)
select '5a5069a7-42b0-4a90-a0e1-9722d863aa60'::uuid, 'Coxiro (pruebas)', 'autonomo', 'Cuenta de pruebas', 'coxiro-pruebas', 'coxiro-pruebas', 'pending'
where exists (select 1 from users where id = '5a5069a7-42b0-4a90-a0e1-9722d863aa60')
  and not exists (select 1 from providers where user_id = '5a5069a7-42b0-4a90-a0e1-9722d863aa60');
