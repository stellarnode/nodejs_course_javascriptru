module.exports.get = async function(ctx, next) {
    ctx.body = {
        register: 'POST /api/register',
        login: 'POST /api/login',
        check: 'GET /api/ to test authentication with JWT'
    };
}