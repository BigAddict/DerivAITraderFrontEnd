// assets/js/pageInjector.js
/**
 * Loads content from a specified page into the 'pageIndex' div and executes any JavaScript code within it.
 * Implements resource cleanup and error handling.
 * @param {string} pageName - The name of the page to load (e.g., "market.html").
 */
async function loadPage(pageName) {
  try {
    const pageIndex = document.getElementById('pageIndex');

    // 1. Cleanup Existing Resources (Crucial for Avoiding Conflicts)
    cleanupPage(pageIndex);

    // 2. Fetch and Inject the New HTML
    const response = await fetch(pageName);
    if (!response.ok) {
      throw new Error(`Failed to load ${pageName}: ${response.status}`);
    }
    const html = await response.text();
    pageIndex.innerHTML = html;

    // 3. Execute Script Tags within the Loaded HTML
    executeScripts(pageIndex);
  } catch (error) {
    console.error('Error loading page:', error);
    document.getElementById('pageIndex').innerHTML = `<p>Error loading page: ${error.message}</p>`;
  }
}

/**
 * Cleans up resources associated with the previously loaded page to prevent conflicts.
 * This includes removing script tags and any other event listeners or resources that
 * might be left behind.
 * @param {HTMLElement} pageIndex - The 'pageIndex' div element.
 */
function cleanupPage(pageIndex) {
  // 1. Remove Script Tags:  Important for preventing duplicate execution and conflicts.
  const oldScripts = pageIndex.querySelectorAll('script');
  oldScripts.forEach(script => {
    script.remove(); // Removes the script tag from the DOM
  });

  // 2. Remove any dynamically added event listeners.  This is more challenging
  //    because you need to know *which* event listeners were added. If you're using
  //    a framework like React or Vue, this might be handled by the framework itself.
  //    For simple cases, you might use data attributes to track listeners.
  //  Example (requires that you've added a 'data-cleanup' attribute to elements):
  const elementsToClean = pageIndex.querySelectorAll('[data-cleanup]');
  elementsToClean.forEach(element => {
    //Remove click events:
    element.onclick = null
  });


  // 3.  If you're using any libraries that create global objects or modify the DOM
  //     in a way that needs to be undone, you'll need to add code here to clean them up.
  //     For example, if you're using a charting library, you might need to destroy the chart.
  //     The exact cleanup steps will depend on the specific libraries you're using.
}

/**
 * Executes the script tags within the given HTML element.
 * This is necessary because simply setting `innerHTML` does not automatically execute scripts.
 * @param {HTMLElement} pageIndex - The 'pageIndex' div element.
 */
function executeScripts(pageIndex) {
  const scripts = pageIndex.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    try {
      eval(scripts[i].innerText); // Execute the script
    } catch (error) {
      console.error('Error executing script:', scripts[i], error);
    }
  }
}
