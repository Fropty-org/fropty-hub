-- Remove o trigger legado on_auth_user_created (fn: handle_new_user) que
-- disparava antes do nosso trigger e inseria o perfil com token_balance=0 e
-- plan=NULL, sobrepondo os valores corretos do convite.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
