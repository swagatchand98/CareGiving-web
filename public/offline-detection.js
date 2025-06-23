// Offline detection script
(function() {
  // Function to handle offline status
  function handleOfflineStatus() {
    if (!navigator.onLine && !window.location.pathname.includes('/offline')) {
      // Save the current URL to return to when back online
      sessionStorage.setItem('lastOnlinePage', window.location.href);
      
      // Redirect to offline page
      window.location.href = '/offline';
    }
  }

  // Function to handle online status
  function handleOnlineStatus() {
    if (navigator.onLine && window.location.pathname.includes('/offline')) {
      // Get the last page the user was on
      const lastPage = sessionStorage.getItem('lastOnlinePage') || '/';
      
      // Redirect back to the last page
      window.location.href = lastPage;
    }
  }

  // Add event listeners for online/offline events
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);

  // Check status immediately on script load
  if (!navigator.onLine && !window.location.pathname.includes('/offline')) {
    handleOfflineStatus();
  }
})();
