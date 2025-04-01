class PageInjector {
  constructor() {
    this.currentPage = null;
    this.currentScripts = [];
    this.currentCleanupCallbacks = [];
  }

  async loadPage(pageName) {
    try {
      // Cleanup previous page
      await this.cleanupCurrentPage();

      // Show loading state
      this.showLoadingState();

      // Fetch new page
      const response = await fetch(pageName);
      if (!response.ok) throw new Error(`Failed to load ${pageName}`);
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Inject content
      const pageIndex = document.getElementById('pageIndex');
      pageIndex.innerHTML = doc.body.innerHTML;
      
      // Handle scripts
      this.currentScripts = Array.from(doc.scripts);
      await this.executeScripts();
      
      // Store cleanup callbacks if any
      if (window.currentPageCleanup) {
        this.currentCleanupCallbacks = window.currentPageCleanup;
        delete window.currentPageCleanup;
      }
      
      this.currentPage = pageName;
      this.hideLoadingState();
      
    } catch (error) {
      console.error('Page load error:', error);
      document.getElementById('pageIndex').innerHTML = `
        <div class="alert alert-danger">
          Error loading page: ${error.message}
        </div>
      `;
      this.hideLoadingState();
    }
  }

  async executeScripts() {
    for (const script of this.currentScripts) {
      try {
        if (script.src) {
          await this.loadExternalScript(script.src);
        } else {
          const newScript = document.createElement('script');
          newScript.text = script.text;
          document.body.appendChild(newScript);
          document.body.removeChild(newScript);
        }
      } catch (error) {
        console.error('Script execution error:', error);
      }
    }
  }

  loadExternalScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async cleanupCurrentPage() {
    // Run cleanup callbacks
    for (const callback of this.currentCleanupCallbacks) {
      try {
        await callback();
      } catch (error) {
        console.error('Cleanup callback error:', error);
      }
    }
    
    // Clear scripts
    this.currentScripts = [];
    this.currentCleanupCallbacks = [];
  }

  showLoadingState() {
    const pageIndex = document.getElementById('pageIndex');
    pageIndex.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }

  hideLoadingState() {
    // Could add transition effects here
  }
}

export const pageInjector = new PageInjector();
