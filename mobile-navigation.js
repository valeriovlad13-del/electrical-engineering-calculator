/* Standalone mobile navigation loaded before calculator code. */
(() => {
  "use strict";
  function init() {
    const body=document.body, header=document.querySelector(".site-header");
    const toggle=document.getElementById("mobile-menu-toggle");
    const menu=document.getElementById("mobile-calculator-menu");
    const backdrop=document.getElementById("mobile-menu-backdrop");
    const cards=[...document.querySelectorAll(".calculator-card[id]")];
    const mobile=matchMedia("(max-width: 600px)");
    if(!toggle||!menu||!cards.length)return;
    function close(){
      menu.hidden=true; menu.classList.remove("mobile-sidebar-open");
      if(backdrop)backdrop.hidden=true;
      body.classList.remove("mobile-sidebar-open");
      if(header)header.classList.remove("header-menu-open");
      toggle.setAttribute("aria-expanded","false");
      toggle.setAttribute("aria-label","Open calculator menu");
    }
    function open(){
      menu.hidden=false; menu.classList.add("mobile-sidebar-open");
      if(backdrop)backdrop.hidden=false;
      body.classList.add("mobile-sidebar-open");
      if(header)header.classList.add("header-menu-open");
      toggle.setAttribute("aria-expanded","true");
      toggle.setAttribute("aria-label","Close calculator menu");
    }
    function home(push=true){
      body.classList.remove("mobile-calculator-active");
      body.classList.toggle("mobile-home-active",mobile.matches);
      cards.forEach(c=>c.classList.remove("mobile-active-calculator"));
      close();
      if(push&&location.hash!=="#top")history.pushState({mobileHome:true},"","#top");
      window.scrollTo(0,0);
    }
    function calculator(id,push=true){
      const selected=cards.find(c=>c.id===id); if(!selected)return false;
      if(!mobile.matches){if(push)location.hash=id;return true;}
      body.classList.add("mobile-calculator-active");
      body.classList.remove("mobile-home-active");
      cards.forEach(c=>c.classList.toggle("mobile-active-calculator",c===selected));
      close();
      if(push&&location.hash!=="#"+id)history.pushState({mobileCalculator:id},"","#"+id);
      window.scrollTo(0,0);return true;
    }
    toggle.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();menu.hidden?open():close();});
    if(backdrop)backdrop.addEventListener("click",close);
    menu.addEventListener("click",e=>{
      const a=e.target.closest("a[href^='#']");if(!a)return;
      const id=a.getAttribute("href").slice(1);
      if(!mobile.matches){close();return;}
      e.preventDefault();e.stopPropagation();
      if(id==="top"||a.hasAttribute("data-mobile-home"))home();else calculator(id);
    });
    document.querySelectorAll(".calculator-nav a[href^='#']").forEach(a=>a.addEventListener("click",e=>{
      const id=a.getAttribute("href").slice(1);
      if(mobile.matches&&cards.some(c=>c.id===id)){e.preventDefault();calculator(id);}
    }));
    const brand=document.querySelector(".brand");
    if(brand)brand.addEventListener("click",e=>{if(mobile.matches){e.preventDefault();home();}});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!menu.hidden){close();toggle.focus();}});
    addEventListener("popstate",()=>{
      if(!mobile.matches)return;const id=location.hash.slice(1);
      if(!id||id==="top")home(false);else if(!calculator(id,false))home(false);
    });
    const breakpoint=()=>{
      close();
      if(!mobile.matches){body.classList.remove("mobile-home-active","mobile-calculator-active");cards.forEach(c=>c.classList.remove("mobile-active-calculator"));return;}
      const id=location.hash.slice(1);if(id&&id!=="top"&&calculator(id,false))return;home(false);
    };
    if(mobile.addEventListener)mobile.addEventListener("change",breakpoint);else mobile.addListener(breakpoint);
    if(mobile.matches){const id=location.hash.slice(1);if(!id||id==="top"||!calculator(id,false))home(false);}else close();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
