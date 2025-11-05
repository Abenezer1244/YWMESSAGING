import{e}from"./index-BVn4UIJl.js";async function s(){return(await e.get("/billing/plan")).data}async function i(){return(await e.get("/billing/trial")).data}async function r(){return(await e.delete("/billing/cancel")).data}async function o(n){return(await e.post("/billing/payment-intent",{planName:n})).data}export{s as a,o as b,r as c,i as g};
//# sourceMappingURL=billing-DjOorEwP.js.map
