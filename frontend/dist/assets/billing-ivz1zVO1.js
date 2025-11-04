import{i as t}from"./index-BJdrkPsl.js";async function s(){return(await t.get("/billing/plan")).data}async function i(){return(await t.get("/billing/trial")).data}async function r(){return(await t.delete("/billing/cancel")).data}async function o(n){return(await t.post("/billing/payment-intent",{planName:n})).data}export{s as a,o as b,r as c,i as g};
//# sourceMappingURL=billing-ivz1zVO1.js.map
