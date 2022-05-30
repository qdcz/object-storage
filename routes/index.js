const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Object-storage',
    describe: "welcome to use object-storage service!"
  })
})

router.get('/test', async (ctx, next) => {
  ctx.body = {code:200,data:666}
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
