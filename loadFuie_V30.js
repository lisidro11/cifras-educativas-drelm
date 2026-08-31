async function loadFuie(codlocal){
  if(!codlocal || !FCORE[codlocal]) return;

  const loading = $("#fuieLoading");
  const container = $("#fuieGroups");
  const codigo = String(codlocal).trim();

  loading.textContent = "Cargando FUIE…";
  container.innerHTML = "";

  try{
    // El índice debe estar cargado desde index.html.
    const indice = window.DRELM_FUIE_INDEX || {};
    const archivo = indice[codigo];

    if(!archivo){
      loading.textContent =
        `No se encontró información FUIE para el código local ${codigo}.`;
      return;
    }

    // Limpiar únicamente el archivo FUIE cargado anteriormente.
    document
      .querySelectorAll('script[data-fuie-detail="1"]')
      .forEach(s => s.remove());

    window.DRELM_FUIE_DETAIL = undefined;

    await new Promise((resolve,reject)=>{
      const script = document.createElement("script");

      script.src = `details/fuie_ugel/${archivo}?v=30`;
      script.dataset.fuieDetail = "1";

      script.onload = resolve;
      script.onerror = () =>
        reject(new Error(`No se pudo cargar ${archivo}`));

      document.body.appendChild(script);
    });

    const obj = window.DRELM_FUIE_DETAIL || {};
    const detalle = obj[codigo];

    if(!detalle){
      loading.textContent =
        `El índice encontró ${archivo}, pero el código local ${codigo} no está disponible en el archivo.`;
      return;
    }

    loading.textContent = "";

    renderGroups(
      container,
      filterZeroOnlyGroups(detalle.groups || [])
    );

  }catch(error){
    console.error("Error FUIE V30:", error);
    loading.textContent = "No se pudo cargar la información FUIE.";
    container.innerHTML = "";
  }
}
