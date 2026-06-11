/* Fase de la campaña → data-phase en <html>.
   Lo usan el home (banner + hero) y el nav (link "Etapa 2").
   Override para previsualizar: ?phase=eliminatorias  */
(function(){
  var cfg = window.STANLEY || {};
  var override = new URLSearchParams(location.search).get('phase');
  var phase = override || cfg.PHASE || 'inscripcion';
  document.documentElement.setAttribute('data-phase', phase);
})();
