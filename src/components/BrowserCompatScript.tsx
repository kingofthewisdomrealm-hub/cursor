export function BrowserCompatScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
try{
  if(typeof window!=="undefined"){
    window.__firefox__=window.__firefox__||{reader:{}};
    window.addEventListener("error",function(e){
      var m=e.message||"";
      if(m.indexOf("__firefox__")!==-1||m.indexOf("firefox")!==-1){
        e.preventDefault();return true;
      }
    },true);
  }
}catch(e){}
        `.trim(),
      }}
    />
  );
}
