module.exports = {
    // signed:true,
    maxAge: 60*60*1000,  //过期时间60min
    path: "/", // 默认是'/'，表示所有路径都能访问。
    // domain: "",
    secure: false, // 安全 cookie 默认 false,设置成 true 表示 只有 https 可以访问。
    httpOnly: true,
    overwrite: true, // 是否覆盖以前的cookie
}