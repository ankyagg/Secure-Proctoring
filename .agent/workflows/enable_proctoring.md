---
description: Re-enable all proctoring restrictions in CodingWorkspace
---

## Steps to Re-enable Proctoring

Replace the empty `useEffect` in `CodingWorkspace.tsx` (around line 157) with the full proctoring logic below:

```tsx
useEffect(() => {
  const logViolation = (reason: string) => {
    setViolations(prev => {
      const newCount = prev + 1;
      console.log(reason);
      addWarning?.();
      if (newCount >= 5) {
        alert("Too many violations. Auto submitting...");
        handleSubmit();
      }
      return newCount;
    });
  };

  const handleVisibility = () => {
    if (document.hidden) logViolation("Tab switched");
  };

  const handleBlur = () => {
    logViolation("Window lost focus");
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) logViolation("Exited fullscreen");
  };

  const blockCopyPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    logViolation("Copy/Paste attempt");
  };

  const blockRightClick = (e: MouseEvent) => {
    e.preventDefault();
    logViolation("Right click disabled");
  };

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {}
  };

  enterFullscreen();

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("blur", handleBlur);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("copy", blockCopyPaste);
  document.addEventListener("paste", blockCopyPaste);
  document.addEventListener("contextmenu", blockRightClick);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("blur", handleBlur);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("copy", blockCopyPaste);
    document.removeEventListener("paste", blockCopyPaste);
    document.removeEventListener("contextmenu", blockRightClick);
  };
}, []);
```

This re-enables:
- Tab switch detection
- Window focus loss detection
- Fullscreen enforcement (auto enters fullscreen)
- Copy/paste blocking
- Right-click blocking
- Auto-submit after 5 violations
