/**
 * Raja Vaishali Vlog - Official Client Script
 * Pure Vanilla JavaScript (No Frameworks)
 * Handles:
 * - Loading Screen Transition
 * - Dynamic Ambient Canvas Particles
 * - Sticky Glassmorphism Header & Scroll Spy
 * - Mobile Navigation Drawer
 * - Category Filtering with Fluid Animations
 * - Instagram Official Embed Processing
 * - Interactive Lightbox / Modal Viewer
 * - Button Ripple Micro-Interactions
 * - Intersection Observer Scroll Reveals
 * - Smooth Back To Top Floating Trigger
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Instant Load Handler (No Animated Loader Delay)
     -------------------------------------------------------------------------- */
  const loaderScreen = document.getElementById('loader-screen');
  if (loaderScreen) {
    loaderScreen.style.display = 'none';
    loaderScreen.remove();
  }

  /* --------------------------------------------------------------------------
     2. Sticky Glassmorphism Navbar & Active Link Tracking (Throttled)
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link, .drawer-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('back-to-top');

  let lastActiveScrollY = 0;
  function handleNavbarScroll() {
    const scrollY = window.scrollY;

    // Toggle navbar glass
    if (scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Toggle back to top button
    if (backToTopBtn) {
      if (scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Scroll spy for active link - sampled every 50px to eliminate DOM layout thrashing
    if (Math.abs(scrollY - lastActiveScrollY) >= 50) {
      lastActiveScrollY = scrollY;
      let currentSectionId = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 140;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}` || (currentSectionId === '' && href === '#home')) {
          link.classList.add('active');
        }
      });
    }
  }

  let isScrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        handleNavbarScroll();
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  handleNavbarScroll();

  /* --------------------------------------------------------------------------
     3. Smooth Anchor Scrolling & Filter Navigation
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // If navigation item carries a category filter request (e.g. #vlogs, #shorts)
        const filterCategory = this.getAttribute('data-filter-target');
        if (filterCategory) {
          applyCategoryFilter(filterCategory);
        }

        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile drawer if opened
        closeMobileDrawer();
      }
    });
  });

  /* --------------------------------------------------------------------------
     4. Mobile Navigation Drawer
     -------------------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerClose = document.getElementById('drawer-close');

  function openMobileDrawer() {
    if (mobileDrawer && drawerBackdrop) {
      mobileDrawer.classList.add('open');
      drawerBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileDrawer() {
    if (mobileDrawer && drawerBackdrop) {
      mobileDrawer.classList.remove('open');
      drawerBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeMobileDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileDrawer();
      closeVideoModal();
    }
  });

  /* --------------------------------------------------------------------------
     5. Category Filtering for Video Pins
     -------------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const pinCards = document.querySelectorAll('.pin-card');

  function applyCategoryFilter(targetCategory) {
    // Update active button state
    filterButtons.forEach((btn) => {
      if (btn.getAttribute('data-category') === targetCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Filter cards with smooth entrance
    pinCards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      const isMatch = targetCategory === 'all' || cardCategory === targetCategory;

      if (isMatch) {
        card.classList.remove('filtered-out');
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.classList.add('filtered-out');
        }, 300);
      }
    });

    // Notify Instagram Embed script to reprocess in case hidden embeds are revealed
    if (window.instgrm && window.instgrm.Embeds) {
      try {
        window.instgrm.Embeds.process();
      } catch (err) {
        console.warn('Instagram Embeds processing:', err);
      }
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      applyCategoryFilter(category);
    });
  });

  /* --------------------------------------------------------------------------
     6. Instagram Official Embed Processor & Embed Toggle
     -------------------------------------------------------------------------- */
  // Process embeds on window load
  function processInstagramEmbeds() {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  }

  window.addEventListener('load', processInstagramEmbeds);

  // Embed toggle buttons: allows users to switch between visual preview cover and live Instagram embed
  const toggleButtons = document.querySelectorAll('.btn-embed-toggle');
  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.pin-card');
      if (!card) return;

      const previewCover = card.querySelector('.pin-preview-cover');
      const embedBox = card.querySelector('.instagram-embed-box');

      if (embedBox && previewCover) {
        const isEmbedVisible = embedBox.style.display !== 'none';
        if (isEmbedVisible) {
          embedBox.style.display = 'none';
          previewCover.style.display = 'block';
          btn.title = 'Switch to official Instagram embed';
        } else {
          previewCover.style.display = 'none';
          embedBox.style.display = 'flex';
          btn.title = 'Switch to visual cover';
          processInstagramEmbeds();
        }
      }
    });
  });

  /* --------------------------------------------------------------------------
     7. Interactive Video Modal / Lightbox (Plays directly on Website)
     -------------------------------------------------------------------------- */
  const localReelMap = {
    'DZ6Ja4UKfAx': {
      video: '/src/assets/videos/reel_DZ6Ja4UKfAx.mp4',
      image: '/src/assets/images/reel_DZ6Ja4UKfAx.jpg',
      title: 'Daily Life Chronicles & Adventures'
    },
    'DZ3vFrBow-T': {
      video: '/src/assets/videos/reel_DZ3vFrBow-T.mp4',
      image: '/src/assets/images/reel_DZ3vFrBow-T.jpg',
      title: 'Unfiltered Moments & Joy'
    },
    'DbhVLJeo7E7': {
      video: '/src/assets/videos/reel_DbhVLJeo7E7.mp4',
      image: '/src/assets/images/reel_DbhVLJeo7E7.jpg',
      title: 'Candid Memories & Spontaneous Moments'
    },
    'DbfmNeoIgVZ': {
      video: '/src/assets/videos/reel_DbfmNeoIgVZ.mp4',
      image: '/src/assets/images/reel_DbfmNeoIgVZ.jpg',
      title: 'Sunset Trails & Heritage Alleyways'
    }
  };

  const videoModal = document.getElementById('video-modal');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalLink = document.getElementById('modal-link');
  const modalMediaFrame = document.querySelector('.modal-media-frame');
  const modalInlinePlayBtn = document.getElementById('modal-inline-play-btn');

  function openVideoModal(title, desc, url, imageSrc, videoSrc, reelId) {
    if (!videoModal) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalLink) modalLink.href = url || 'https://www.instagram.com/raja_vaishali_vlog/';

    // Detect Instagram reel ID if not explicitly provided
    let cleanReelId = reelId || '';
    if (!cleanReelId && url) {
      const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/i);
      if (match) cleanReelId = match[1];
    }

    const localMatch = cleanReelId ? localReelMap[cleanReelId] : null;
    const activeVideoSrc = videoSrc || (localMatch ? localMatch.video : '');

    if (modalMediaFrame) {
      if (activeVideoSrc) {
        // Direct HTML5 Video Player inside website - Full duration and full audio
        modalMediaFrame.innerHTML = `
          <div class="video-player-wrapper">
            <video id="active-modal-video" class="video-player-element" controls autoplay playsinline preload="auto" loop>
              <source src="${activeVideoSrc}" type="video/mp4">
              Your browser does not support HTML5 video playback.
            </video>
            <div id="video-unmute-overlay" class="video-unmute-overlay" style="display: none;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <span>Tap for Sound / आवाज चालू करें 🔊</span>
            </div>
          </div>`;

        const vid = document.getElementById('active-modal-video');
        const unmuteOverlay = document.getElementById('video-unmute-overlay');

        if (vid) {
          vid.volume = 1.0;
          vid.muted = false;

          const handleUnmute = (e) => {
            if (e) e.stopPropagation();
            vid.muted = false;
            vid.volume = 1.0;
            if (unmuteOverlay) unmuteOverlay.style.display = 'none';
          };

          if (unmuteOverlay) {
            unmuteOverlay.addEventListener('click', handleUnmute);
          }

          // Modern browser autoplay policy handler: try with audio first
          const playPromise = vid.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Successfully playing! If browser muted it silently, display unmute button
              if (vid.muted && unmuteOverlay) {
                unmuteOverlay.style.display = 'flex';
              }
            }).catch((err) => {
              console.warn('Autoplay with sound restricted, playing muted with unmute option:', err);
              vid.muted = true;
              vid.play().then(() => {
                if (unmuteOverlay) {
                  unmuteOverlay.style.display = 'flex';
                }
              }).catch(() => {});
            });
          }
        }
      } else if (cleanReelId) {
        // Official In-Website Instagram Reel Embed (Plays inside website)
        modalMediaFrame.innerHTML = `
          <div style="position:relative; width:100%; max-width:440px; margin:0 auto; aspect-ratio:9/16; background:#050508; border-radius:var(--radius-md); overflow:hidden; box-shadow:0 12px 35px rgba(0,0,0,0.8);">
            <iframe 
              src="https://www.instagram.com/reel/${cleanReelId}/embed/" 
              width="100%" 
              height="100%" 
              frameborder="0" 
              scrolling="no" 
              allowtransparency="true" 
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              style="border:none; width:100%; height:100%; min-height:480px; display:block;">
            </iframe>
          </div>`;
      } else if (imageSrc) {
        modalMediaFrame.innerHTML = `
          <div style="position:relative; width:100%; border-radius:var(--radius-md); overflow:hidden; background:#000;">
            <img id="modal-preview-img" src="${imageSrc}" alt="${title}" style="width:100%; height:auto; max-height:480px; object-fit:cover; display:block; margin:0 auto;" />
          </div>`;
      }
    }

    if (modalInlinePlayBtn) {
      modalInlinePlayBtn.onclick = () => {
        const vid = document.getElementById('active-modal-video');
        if (vid) {
          vid.currentTime = 0;
          vid.muted = false;
          vid.volume = 1.0;
          vid.play().catch(() => {});
          const unmuteOverlay = document.getElementById('video-unmute-overlay');
          if (unmuteOverlay) unmuteOverlay.style.display = 'none';
        }
      };
    }

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    // Instantly stop audio/video playback when modal is closed
    const playingVideo = videoModal.querySelector('video');
    if (playingVideo) {
      playingVideo.pause();
      playingVideo.currentTime = 0;
      playingVideo.removeAttribute('src');
      playingVideo.load();
    }
    if (modalMediaFrame) {
      modalMediaFrame.innerHTML = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeVideoModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);

  // Attach modal trigger to card covers and play buttons
  function attachModalTrigger(elementOrCard) {
    if (!elementOrCard) return;
    const card = elementOrCard.classList.contains('pin-card') ? elementOrCard : elementOrCard.closest('.pin-card');
    if (!card) return;

    const clickableElements = card.querySelectorAll('.pin-preview-cover, .btn-play-vlog, .btn-watch-website');
    clickableElements.forEach((el) => {
      if (el.dataset.modalAttached === 'true') return;
      el.dataset.modalAttached = 'true';

      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const title = card.querySelector('.pin-title')?.textContent || 'Raja Vlog Vaishali Reel';
        const desc = card.querySelector('.pin-description')?.textContent || 'Watch this captivating moment on Raja Vlog Vaishali.';
        const url = card.querySelector('.btn-watch-ig')?.getAttribute('href') || 'https://www.instagram.com/raja_vaishali_vlog/';
        const img = card.querySelector('.pin-preview-cover img')?.getAttribute('src') || card.getAttribute('data-cover') || '';
        const videoSrc = card.getAttribute('data-video-src') || '';
        const reelId = card.getAttribute('data-reel-id') || '';

        openVideoModal(title, desc, url, img, videoSrc, reelId);
      });
    });
  }

  document.querySelectorAll('.pin-card').forEach(attachModalTrigger);

  /* --------------------------------------------------------------------------
     8. Creator Upload Studio (Upload & Publish Videos/Vlogs Directly)
     -------------------------------------------------------------------------- */
  const uploadModal = document.getElementById('upload-modal');
  const uploadBackdrop = document.getElementById('upload-backdrop');
  const uploadCloseBtn = document.getElementById('upload-close-btn');
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  const openUploadNavBtn = document.getElementById('open-upload-btn-nav');
  const openUploadSectionBtn = document.getElementById('open-upload-btn-section');
  const mobileNavUploadBtn = document.getElementById('mobile-nav-upload-btn');
  const drawerUploadBtn = document.getElementById('drawer-upload-btn');
  const heroUploadBtn = document.getElementById('hero-upload-btn');
  const submitUploadBtn = document.getElementById('submit-upload-btn');

  const tabFileMode = document.getElementById('tab-file-mode');
  const tabLinkMode = document.getElementById('tab-link-mode');
  const fileUploadSection = document.getElementById('file-upload-section');
  const linkUploadSection = document.getElementById('link-upload-section');

  const videoDropzone = document.getElementById('video-dropzone');
  const videoFileInput = document.getElementById('video-file-input');
  const videoFilePreviewBox = document.getElementById('video-file-preview-box');
  const videoPreviewPlayer = document.getElementById('video-preview-player');
  const videoFileName = document.getElementById('video-file-name');

  const vlogTitleInput = document.getElementById('vlog-title-input');
  const vlogCategorySelect = document.getElementById('vlog-category-select');
  const vlogDescInput = document.getElementById('vlog-desc-input');
  const reelUrlInput = document.getElementById('reel-url-input');
  const linkThumbnailPreviewBox = document.getElementById('link-thumbnail-preview-box');
  const linkThumbnailImg = document.getElementById('link-thumbnail-img');

  const toastBox = document.getElementById('toast-box');
  const toastMessage = document.getElementById('toast-message');

  let activeUploadMode = 'file';
  let uploadedFileBlobUrl = '';
  let capturedThumbnailUrl = '';

  function showToast(msg) {
    if (!toastBox) return;
    if (toastMessage) toastMessage.textContent = msg;
    toastBox.classList.add('show');
    setTimeout(() => {
      toastBox.classList.remove('show');
    }, 3800);
  }

  function openUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.add('active');
    uploadModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeMobileDrawer();
  }

  function closeUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.remove('active');
    uploadModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Bind all upload triggers across desktop & mobile
  if (openUploadNavBtn) openUploadNavBtn.addEventListener('click', openUploadModal);
  if (openUploadSectionBtn) openUploadSectionBtn.addEventListener('click', openUploadModal);
  if (mobileNavUploadBtn) mobileNavUploadBtn.addEventListener('click', openUploadModal);
  if (drawerUploadBtn) drawerUploadBtn.addEventListener('click', openUploadModal);
  if (heroUploadBtn) heroUploadBtn.addEventListener('click', openUploadModal);

  if (uploadCloseBtn) uploadCloseBtn.addEventListener('click', closeUploadModal);
  if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModal);
  if (uploadBackdrop) uploadBackdrop.addEventListener('click', closeUploadModal);

  // Tab switching
  if (tabFileMode && tabLinkMode) {
    tabFileMode.addEventListener('click', () => {
      activeUploadMode = 'file';
      tabFileMode.classList.add('active');
      tabLinkMode.classList.remove('active');
      if (fileUploadSection) fileUploadSection.style.display = 'block';
      if (linkUploadSection) linkUploadSection.style.display = 'none';
    });

    tabLinkMode.addEventListener('click', () => {
      activeUploadMode = 'link';
      tabLinkMode.classList.add('active');
      tabFileMode.classList.remove('active');
      if (fileUploadSection) fileUploadSection.style.display = 'none';
      if (linkUploadSection) linkUploadSection.style.display = 'block';
    });
  }

  /* --------------------------------------------------------------------------
     Automatic Video Thumbnail Detection (Instagram, YouTube & Video File)
     -------------------------------------------------------------------------- */
  function detectThumbnailFromUrl(url) {
    if (!url) return null;
    const cleanUrl = url.trim();

    // 1. Instagram Reel / Post
    const igMatch = cleanUrl.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/i);
    if (igMatch) {
      const reelId = igMatch[1];
      const local = localReelMap[reelId];
      return {
        type: 'instagram',
        reelId: reelId,
        thumbnailUrl: local ? local.image : `https://www.instagram.com/p/${reelId}/media/?size=l`,
        videoSrc: local ? local.video : '',
        title: local ? local.title : ''
      };
    }

    // 2. YouTube (Shorts or Watch or youtu.be)
    const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^/?#&]+)/i);
    if (ytMatch) {
      const ytId = ytMatch[1];
      return {
        type: 'youtube',
        ytId: ytId,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        videoSrc: '',
        title: 'New Video Episode'
      };
    }

    // 3. Direct image link
    if (cleanUrl.match(/\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i)) {
      return {
        type: 'image',
        thumbnailUrl: cleanUrl,
        videoSrc: '',
        title: ''
      };
    }

    return null;
  }

  function handleLinkInput(url) {
    const detected = detectThumbnailFromUrl(url);
    if (detected && detected.thumbnailUrl) {
      capturedThumbnailUrl = detected.thumbnailUrl;
      if (linkThumbnailImg) {
        linkThumbnailImg.src = detected.thumbnailUrl;
      }
      if (linkThumbnailPreviewBox) {
        linkThumbnailPreviewBox.style.display = 'block';
      }
      if (vlogTitleInput && (!vlogTitleInput.value.trim() || vlogTitleInput.value === 'New Instagram Reel')) {
        if (detected.title) {
          vlogTitleInput.value = detected.title;
        } else if (detected.type === 'instagram') {
          vlogTitleInput.value = 'New Instagram Reel';
        } else if (detected.type === 'youtube') {
          vlogTitleInput.value = 'New Video Episode';
        }
      }
    } else {
      if (linkThumbnailPreviewBox) {
        linkThumbnailPreviewBox.style.display = 'none';
      }
    }
  }

  if (reelUrlInput) {
    reelUrlInput.addEventListener('input', (e) => {
      handleLinkInput(e.target.value);
    });
    reelUrlInput.addEventListener('paste', () => {
      setTimeout(() => {
        handleLinkInput(reelUrlInput.value);
      }, 50);
    });
  }

  // File Dropzone & Native Input Handling
  if (videoFileInput) {
    videoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleVideoFile(e.target.files[0]);
      }
    });
  }

  if (videoDropzone) {
    videoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      videoDropzone.classList.add('dragover');
    });

    videoDropzone.addEventListener('dragleave', () => {
      videoDropzone.classList.remove('dragover');
    });

    videoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      videoDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleVideoFile(e.dataTransfer.files[0]);
      }
    });
  }

  function handleVideoFile(file) {
    if (!file) return;
    try {
      uploadedFileBlobUrl = URL.createObjectURL(file);
      if (videoPreviewPlayer) {
        videoPreviewPlayer.src = uploadedFileBlobUrl;
        videoPreviewPlayer.load();

        // Capture thumbnail frame from user video
        videoPreviewPlayer.onloadeddata = () => {
          try {
            videoPreviewPlayer.currentTime = 0.5;
          } catch(err) {}
        };
        videoPreviewPlayer.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = videoPreviewPlayer.videoWidth || 480;
            canvas.height = videoPreviewPlayer.videoHeight || 640;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoPreviewPlayer, 0, 0, canvas.width, canvas.height);
            capturedThumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
          } catch(err) {
            console.warn('Frame capture error:', err);
          }
        };
      }
      if (videoFileName) {
        const sizeMb = file.size ? (file.size / (1024 * 1024)).toFixed(1) : '0';
        videoFileName.textContent = `✓ Selected: ${file.name || 'Video'} (${sizeMb} MB)`;
      }
      if (videoFilePreviewBox) {
        videoFilePreviewBox.style.display = 'block';
      }

      // Auto-fill title if empty
      if (vlogTitleInput && !vlogTitleInput.value.trim()) {
        const cleanName = (file.name || 'My New Vlog').replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        vlogTitleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }
      showToast('🎬 Video selected! Enter details and tap Publish.');
    } catch (err) {
      console.warn('Video handle error:', err);
    }
  }

  // Count Update Function
  function updateCategoryCounts() {
    const allPins = document.querySelectorAll('.pin-card');
    let vlogs = 0, shorts = 0, miniVlogs = 0;

    allPins.forEach((card) => {
      const cat = card.getAttribute('data-category');
      if (cat === 'vlogs') vlogs++;
      else if (cat === 'shorts') shorts++;
      else if (cat === 'mini-vlogs') miniVlogs++;
    });

    const countAll = document.getElementById('count-all');
    const countVlogs = document.getElementById('count-vlogs');
    const countShorts = document.getElementById('count-shorts');
    const countMini = document.getElementById('count-mini-vlogs');

    if (countAll) countAll.textContent = allPins.length;
    if (countVlogs) countVlogs.textContent = vlogs;
    if (countShorts) countShorts.textContent = shorts;
    if (countMini) countMini.textContent = miniVlogs;
  }

  // Publish / Upload Submit
  if (submitUploadBtn) {
    submitUploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = vlogTitleInput ? vlogTitleInput.value.trim() : '';
      const category = vlogCategorySelect ? vlogCategorySelect.value : 'vlogs';
      const desc = vlogDescInput ? vlogDescInput.value.trim() : 'New video by Raja Vlog Vaishali.';
      const reelUrl = reelUrlInput ? reelUrlInput.value.trim() : '';

      if (!title) {
        showToast('⚠️ Please enter a title for your vlog.');
        if (vlogTitleInput) {
          vlogTitleInput.focus();
          vlogTitleInput.style.borderColor = '#ef4444';
          setTimeout(() => { vlogTitleInput.style.borderColor = ''; }, 3000);
        }
        return;
      }

      if (activeUploadMode === 'file' && !uploadedFileBlobUrl && !reelUrl) {
        showToast('⚠️ Please choose a video or paste an Instagram/video link.');
        return;
      }

      if (activeUploadMode === 'link' && !reelUrl) {
        showToast('⚠️ Please paste an Instagram Reel or Video URL.');
        if (reelUrlInput) {
          reelUrlInput.focus();
          reelUrlInput.style.borderColor = '#ef4444';
          setTimeout(() => { reelUrlInput.style.borderColor = ''; }, 3000);
        }
        return;
      }

      // Detect thumbnail and video source from provided URL or captured video frame
      const detected = detectThumbnailFromUrl(reelUrl);
      let finalCoverImage = '';
      let detectedVideoSrc = '';
      if (detected && detected.thumbnailUrl) {
        finalCoverImage = detected.thumbnailUrl;
        if (detected.videoSrc) detectedVideoSrc = detected.videoSrc;
      } else if (capturedThumbnailUrl) {
        finalCoverImage = capturedThumbnailUrl;
      } else {
        finalCoverImage = '/src/assets/images/aesthetic_vlog_banner_1791029050281.jpg';
      }

      const activeVideo = uploadedFileBlobUrl || detectedVideoSrc;

      // Create new Card in DOM
      const card = document.createElement('article');
      card.className = 'pin-card reveal-fade-up revealed';
      card.setAttribute('data-category', category);
      card.setAttribute('data-cover', finalCoverImage);
      if (activeVideo) {
        card.setAttribute('data-video-src', activeVideo);
      }
      
      const igMatch = reelUrl.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/i);
      if (igMatch) {
        card.setAttribute('data-reel-id', igMatch[1]);
      }

      card.innerHTML = `
        <div class="pin-media-container">
          <div class="pin-preview-cover" style="display:block;">
            <img 
              src="${finalCoverImage}" 
              alt="${title}" 
              class="pin-preview-img"
              loading="lazy"
              onerror="this.onerror=null; this.src='/src/assets/images/aesthetic_vlog_banner_1791029050281.jpg';"
            />
            <div class="pin-media-scrim">
              <div class="pin-play-icon">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <span class="pin-badge-corner" style="background:#10b981; color:#fff;">NEW UPLOAD</span>
            <span class="pin-duration-tag">Video</span>
          </div>
        </div>

        <div class="pin-content">
          <div class="pin-meta-header">
            <span class="pin-category-badge">${category.toUpperCase()}</span>
            <div class="pin-stats">
              <span>
                <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                Just Now
              </span>
            </div>
          </div>

          <h3 class="pin-title">${title}</h3>
          <p class="pin-description">${desc}</p>

          <div class="pin-action-bar">
            <button type="button" class="btn-watch-website btn-play-vlog ripple-btn">
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play Video
            </button>
          </div>
        </div>
      `;

      const pinsGrid = document.getElementById('pins-grid');
      if (pinsGrid) {
        pinsGrid.prepend(card);
      }

      // Attach lightbox trigger
      attachModalTrigger(card);

      // Save metadata in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('raja_vlog_custom_uploads') || '[]');
        stored.unshift({ 
          title, 
          category, 
          desc, 
          reelUrl, 
          coverImage: finalCoverImage,
          videoSrc: activeVideo, 
          date: new Date().toISOString() 
        });
        localStorage.setItem('raja_vlog_custom_uploads', JSON.stringify(stored));
      } catch (err) {
        console.warn('Storage saving:', err);
      }

      // Reset form
      if (vlogTitleInput) vlogTitleInput.value = '';
      if (vlogDescInput) vlogDescInput.value = '';
      if (reelUrlInput) reelUrlInput.value = '';
      if (videoFilePreviewBox) videoFilePreviewBox.style.display = 'none';
      if (linkThumbnailPreviewBox) linkThumbnailPreviewBox.style.display = 'none';
      uploadedFileBlobUrl = '';
      capturedThumbnailUrl = '';

      // Update counters
      updateCategoryCounts();

      // Close modal & notify
      closeUploadModal();
      showToast('🎉 Your video has been published with thumbnail!');

      // Smooth scroll to newly uploaded pin
      const targetPos = card.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  }

  // Load saved uploads from localStorage on page start
  function loadSavedUploads() {
    try {
      const stored = JSON.parse(localStorage.getItem('raja_vlog_custom_uploads') || '[]');
      const pinsGrid = document.getElementById('pins-grid');
      if (!pinsGrid || !stored.length) return;

      stored.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'pin-card reveal-fade-up revealed';
        card.setAttribute('data-category', item.category);
        
        const detected = detectThumbnailFromUrl(item.reelUrl);
        const resolvedVideo = item.videoSrc || (detected && detected.videoSrc ? detected.videoSrc : '');
        if (resolvedVideo) {
          card.setAttribute('data-video-src', resolvedVideo);
        }
        const igMatch = (item.reelUrl || '').match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/i);
        if (igMatch) {
          card.setAttribute('data-reel-id', igMatch[1]);
        }

        const coverImg = item.coverImage || (detected ? detected.thumbnailUrl : '/src/assets/images/aesthetic_vlog_banner_1791029050281.jpg');
        card.setAttribute('data-cover', coverImg);

        card.innerHTML = `
          <div class="pin-media-container">
            <div class="pin-preview-cover" style="display:block;">
              <img 
                src="${coverImg}" 
                alt="${item.title}" 
                class="pin-preview-img"
                loading="lazy"
                onerror="this.onerror=null; this.src='/src/assets/images/aesthetic_vlog_banner_1791029050281.jpg';"
              />
              <div class="pin-media-scrim">
                <div class="pin-play-icon">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <span class="pin-badge-corner" style="background:#10b981; color:#fff;">MY VLOG</span>
              <span class="pin-duration-tag">Video</span>
            </div>
          </div>

          <div class="pin-content">
            <div class="pin-meta-header">
              <span class="pin-category-badge">${(item.category || 'VLOGS').toUpperCase()}</span>
              <div class="pin-stats">
                <span>
                  <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  Published
                </span>
              </div>
            </div>

            <h3 class="pin-title">${item.title}</h3>
            <p class="pin-description">${item.desc || 'Video by Raja Vlog Vaishali'}</p>

            <div class="pin-action-bar">
              <button type="button" class="btn-watch-website btn-play-vlog ripple-btn">
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play Video
              </button>
            </div>
          </div>
        `;

        pinsGrid.prepend(card);
        attachModalTrigger(card);
      });

      updateCategoryCounts();
    } catch (err) {
      console.warn('Loading stored uploads:', err);
    }
  }

  loadSavedUploads();

  /* --------------------------------------------------------------------------
     8. Instant Visibility for All Cards & Sections (No Scroll Delay)
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.reveal-fade-up, .reveal-fade-in, .reveal-scale-up').forEach((el) => {
    el.classList.add('revealed');
  });

  /* --------------------------------------------------------------------------
     9. Floating Back To Top Button Click
     -------------------------------------------------------------------------- */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* --------------------------------------------------------------------------
     10. Mobile Bottom Navigation Dock Controller
     -------------------------------------------------------------------------- */
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  mobileNavItems.forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      mobileNavItems.forEach((n) => n.classList.remove('active'));
      this.classList.add('active');

      const filterCategory = this.getAttribute('data-filter');
      const navTarget = this.getAttribute('data-nav-target');

      if (filterCategory) {
        applyCategoryFilter(filterCategory);
        const section = document.getElementById('video-pins');
        if (section) {
          const navHeight = navbar ? navbar.offsetHeight : 60;
          window.scrollTo({
            top: section.getBoundingClientRect().top + window.scrollY - navHeight,
            behavior: 'smooth'
          });
        }
      } else if (navTarget === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (navTarget === 'profile') {
        const profile = document.getElementById('creator-profile');
        if (profile) {
          const navHeight = navbar ? navbar.offsetHeight : 60;
          window.scrollTo({
            top: profile.getBoundingClientRect().top + window.scrollY - navHeight,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  /* --------------------------------------------------------------------------
     10. Ambient Bokeh Stardust Canvas Particles (Desktop Only - Zero Mobile Lag)
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const isMobileDevice = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);

    if (isMobileDevice) {
      // Mobile & touch screens: completely disable canvas to save 100% GPU/CPU and prevent lag
      canvas.style.display = 'none';
    } else {
      const ctx = canvas.getContext('2d');
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      let targetMouseX = width / 2;
      let targetMouseY = height / 2;

      window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
      }, { passive: true });

      window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
          canvas.style.display = 'none';
        } else {
          canvas.style.display = 'block';
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
        }
      });

      const colors = [
        'rgba(255, 140, 26, ',   // Golden Amber
        'rgba(255, 65, 108, ',   // Sunset Rose
        'rgba(220, 39, 67, ',    // Crimson Amber
        'rgba(168, 85, 247, ',   // Cosmic Violet
        'rgba(251, 191, 36, '    // Honey Gold
      ];

      const particles = [];
      const particleCount = 28;

      class Particle {
        constructor() {
          this.reset();
        }

        reset() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.baseSize = Math.random() * 2.2 + 1.2;
          this.size = this.baseSize;
          this.speedX = (Math.random() - 0.5) * 0.35;
          this.speedY = -Math.random() * 0.45 - 0.15;
          this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = Math.random() * 0.4 + 0.2;
          this.pulseSpeed = Math.random() * 0.02 + 0.01;
          this.pulseAngle = Math.random() * Math.PI * 2;
        }

        update() {
          this.pulseAngle += this.pulseSpeed;
          this.size = this.baseSize + Math.sin(this.pulseAngle) * 0.6;

          // Gentle mouse push
          const dx = targetMouseX - this.x;
          const dy = targetMouseY - this.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) { // 150px squared
            const dist = Math.sqrt(distSq);
            const force = (150 - dist) / 150;
            this.x -= (dx / dist) * force * 1.2;
            this.y -= (dy / dist) * force * 1.2;
          }

          this.x += this.speedX;
          this.y += this.speedY;

          if (this.y < -15 || this.x < -15 || this.x > width + 15) {
            this.reset();
            this.y = height + 10;
          }
        }

        draw() {
          const currentAlpha = Math.max(0.08, this.alpha + Math.sin(this.pulseAngle) * 0.15);
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.colorPrefix + currentAlpha + ')';
          ctx.fill();
        }
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      let animationFrameId;
      function animateParticles() {
        if (document.hidden) {
          // Pause when tab is hidden to save battery
          animationFrameId = requestAnimationFrame(animateParticles);
          return;
        }

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }

        animationFrameId = requestAnimationFrame(animateParticles);
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        animateParticles();
      }
    }
  }
});
