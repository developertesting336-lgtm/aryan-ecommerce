const [prod, cat, search] = await Promise.all([
  fetch("https://backend-one-rho-24.vercel.app/api/product/?page=1&limit=5").then(r => r.json()).catch(e => ({ error: e.message })),
  fetch("https://backend-one-rho-24.vercel.app/api/categories/?page=1&limit=5").then(r => r.json()).catch(e => ({ error: e.message })),
  fetch("https://backend-one-rho-24.vercel.app/api/product/search?search=apple&page=1&limit=5").then(r => r.json()).catch(e => ({ error: e.message }))
]);

console.log("PROD:", JSON.stringify(prod).substring(0, 300));
console.log("CAT:", JSON.stringify(cat).substring(0, 300));
console.log("SEARCH:", JSON.stringify(search).substring(0, 300));

