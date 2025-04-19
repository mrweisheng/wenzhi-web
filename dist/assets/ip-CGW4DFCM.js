async function t(){try{const t=await fetch("https://api.ipify.org?format=json");return(await t.json()).ip}catch(t){return""}}export{t as g};
