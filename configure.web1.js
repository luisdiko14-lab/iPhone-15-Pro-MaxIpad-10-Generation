(function () {
  // Random total size: 4GB or 20GB
  var totalGB = Math.random() < 0.5 ? 4 : 20;
  var totalMB = totalGB * 1024;

  // Speed: 90% chance 500 MB/s, 10% chance 10 MB/s
  var speedMBs = Math.random() < 0.9 ? 500 : 10;
  var badLuck = speedMBs === 10;

  console.log("Starting download of " + totalGB + "GB at " + speedMBs + " MB/s" + (badLuck ? " (bad luck)" : ""));
  var downloadedMB = 0;
  var nextMilestone = 10; // log at 10%, 20%, ... 100%

  var timer = setInterval(function () {
    downloadedMB += speedMBs;
    if (downloadedMB > totalMB) downloadedMB = totalMB;

    var percent = (downloadedMB / totalMB) * 100;

    if (percent >= nextMilestone || downloadedMB === totalMB) {
      var pct = Math.min(100, Math.floor(percent));
      console.log("Loading... " + pct + "% (" + Math.floor(downloadedMB) + "MB / " + totalMB + "MB) @ " + speedMBs + " MB/s");
      nextMilestone += 10;
    }

    if (downloadedMB >= totalMB) {
      clearInterval(timer);
      console.log("✅ Done! Total " + totalGB + "GB downloaded in ~" + Math.ceil(totalMB / speedMBs) + "s.");
    }
  }, 1000);
})();
