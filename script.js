document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  const focusSections = Array.from(document.querySelectorAll(".focus-section"));
  const trackTriggers = Array.from(document.querySelectorAll(".track-trigger"));
  const topReleaseDock = document.querySelector(".top-release-dock");
  const topReleasePlayer = document.getElementById("top-release-player");
  const latestReleaseCard = document.querySelector(".latest-release-card");
  const latestReleaseButton = document.querySelector(".hero-latest-button");
  const latestReleasePlayer = document.getElementById("latest-release-player");
  const player = document.getElementById("soundcloud-player");
  const activeTrackKicker = document.getElementById("active-track-kicker");
  const activeTrackTitle = document.getElementById("active-track-title");
  const activeTrackDescription = document.getElementById("active-track-description");
  const activeTrackLink = document.getElementById("active-track-link");
  const activeTrackNote = document.getElementById("active-track-note");
  const galaxyMap = document.querySelector(".galaxy-map");
  const orbits = Array.from(document.querySelectorAll(".orbit"));
  const visionForm = document.getElementById("vision-form");
  const visionMessage = document.getElementById("vision-message");
  const visionCount = document.getElementById("vision-count");
  const visionFormStatus = document.getElementById("vision-form-status");
  const submitFormButton = visionForm?.querySelector(".submit-form-button");
  const submitFormTitle = submitFormButton?.querySelector(".submit-title");
  const contactPortal = document.querySelector(".contact-portal");
  const contactVideo = document.querySelector(".contact-video");
  const yearNode = document.getElementById("year");
  let lockedTrigger = null;
  let foregroundFrame = null;

  const buildEmbedUrl = (trackUrl, autoPlay = false) =>
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23d59a2d&auto_play=${autoPlay ? "true" : "false"}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;

  const setActiveTrack = (trigger, options = {}) => {
    trackTriggers.forEach(item => {
      item.classList.toggle("is-active", item === trigger);
      item.setAttribute("aria-pressed", item === trigger ? "true" : "false");
      const orbit = item.closest(".orbit");

      if (orbit) {
        orbit.classList.toggle("is-active", item === trigger);
      }
    });

    activeTrackKicker.textContent = trigger.dataset.trackKicker;
    activeTrackTitle.textContent = trigger.dataset.trackTitle;
    activeTrackDescription.textContent = trigger.dataset.trackDescription;
    activeTrackLink.href = trigger.dataset.trackUrl;
    activeTrackNote.textContent = trigger.dataset.trackNote;
    player.src = buildEmbedUrl(trigger.dataset.trackUrl, Boolean(options.autoPlay));
    latestReleaseCard?.classList.toggle(
      "is-expanded",
      latestReleaseButton?.dataset.latestTrackUrl === trigger.dataset.trackUrl
    );
  };

  const setHoveredOrbit = orbitToHighlight => {
    orbits.forEach(orbit => {
      orbit.classList.toggle("is-hovered", orbit === orbitToHighlight);
    });

    if (!orbitToHighlight) {
      return;
    }
  };

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  const updateFocusedSection = () => {
    if (!focusSections.length) {
      return;
    }

    const viewportCenter = window.innerHeight * 0.5;
    let closestSection = focusSections[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    focusSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestSection = section;
      }
    });

    focusSections.forEach(section => {
      section.classList.toggle("is-focused", section === closestSection);
    });
  };

  const updateForegroundDepth = () => {
    const scrollRange = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));

    root.style.setProperty("--cosmos-scale", (1 + progress).toFixed(3));
    root.style.setProperty("--mist-scale", (1 + progress * 2).toFixed(3));
    root.style.setProperty("--cosmos-drift", `${(-2 * progress).toFixed(2)}vh`);
    root.style.setProperty("--mist-drift", `${(3 * progress).toFixed(2)}vh`);
  };

  const requestForegroundDepthUpdate = () => {
    if (foregroundFrame) {
      return;
    }

    foregroundFrame = window.requestAnimationFrame(() => {
      foregroundFrame = null;
      updateForegroundDepth();
    });
  };

  const openLatestRelease = ({ autoPlay = true, scrollToEmbed = false, openTopDock = false } = {}) => {
    const latestTrackUrl = latestReleaseButton?.dataset.latestTrackUrl;
    const latestTrackTrigger = trackTriggers.find(trigger => trigger.dataset.trackUrl === latestTrackUrl);

    if (!latestTrackTrigger || !latestReleasePlayer) {
      return;
    }

    lockedTrigger = latestTrackTrigger;
    latestReleaseCard?.classList.add("is-expanded");
    latestReleasePlayer.src = buildEmbedUrl(latestTrackUrl, autoPlay);
    if (openTopDock && topReleaseDock && topReleasePlayer) {
      topReleaseDock.classList.add("is-open");
      topReleasePlayer.src = buildEmbedUrl(latestTrackUrl, autoPlay);
    }
    setActiveTrack(latestTrackTrigger, { autoPlay });

    if (scrollToEmbed) {
      const scrollAnchor = openTopDock && topReleaseDock ? topReleaseDock : latestReleaseCard;

      if (!scrollAnchor) {
        return;
      }

      const targetTop = scrollAnchor.getBoundingClientRect().top + window.scrollY - 18;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth"
      });
    }
  };

  trackTriggers.forEach(trigger => {
    const orbit = trigger.closest(".orbit");

    trigger.addEventListener("click", () => {
      lockedTrigger = trigger;
      setActiveTrack(trigger);
    });

    trigger.addEventListener("mouseenter", () => {
      setHoveredOrbit(orbit);
    });

    trigger.addEventListener("focus", () => {
      setHoveredOrbit(orbit);
    });

    trigger.addEventListener("mouseleave", () => {
      setHoveredOrbit(null);
    });

    trigger.addEventListener("blur", () => {
      setHoveredOrbit(null);
    });
  });

  if (latestReleaseButton) {
    latestReleaseButton.addEventListener("click", () => {
      openLatestRelease({ autoPlay: true, scrollToEmbed: true, openTopDock: true });
    });
  }

  if (galaxyMap && orbits.length) {
    const orbitHoverThreshold = 18;

    galaxyMap.addEventListener("mousemove", event => {
      const mapRect = galaxyMap.getBoundingClientRect();
      const centerX = mapRect.left + mapRect.width / 2;
      const centerY = mapRect.top + mapRect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      let hoveredOrbit = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      orbits.forEach(orbit => {
        const radius = orbit.offsetWidth / 2;
        const delta = Math.abs(distance - radius);

        if (delta <= orbitHoverThreshold && delta < bestDistance) {
          bestDistance = delta;
          hoveredOrbit = orbit;
        }
      });

      setHoveredOrbit(hoveredOrbit);
    });

    galaxyMap.addEventListener("mouseleave", () => {
      setHoveredOrbit(null);
    });
  }

  if (visionMessage && visionCount) {
    const updateVisionCount = () => {
      visionCount.textContent = String(visionMessage.value.length);
    };

    updateVisionCount();
    visionMessage.addEventListener("input", updateVisionCount);
  }

  if (visionForm) {
    const web3FormsEndpoint = "https://api.web3forms.com/submit";
    const defaultSubmitText = submitFormTitle?.textContent || "Send the form";

    const setFieldError = (fieldName, message) => {
      const field = visionForm.querySelector(`[data-field="${fieldName}"]`);

      if (!field) {
        return;
      }

      field.classList.toggle("has-error", Boolean(message));

      const errorNode = field.querySelector(".field-error");

      if (errorNode) {
        errorNode.textContent = message || "";
      }
    };

    const clearFormErrors = () => {
      ["first_name", "email", "phone", "vision_scope"].forEach(fieldName => {
        setFieldError(fieldName, "");
      });

      if (visionFormStatus) {
        visionFormStatus.textContent = "";
        visionFormStatus.classList.remove("is-visible", "is-success");
      }
    };

    const setFormStatus = (message, type = "error") => {
      if (!visionFormStatus) {
        return;
      }

      visionFormStatus.textContent = message;
      visionFormStatus.classList.toggle("is-success", type === "success");
      visionFormStatus.classList.add("is-visible");
    };

    const setSubmitting = isSubmitting => {
      if (submitFormButton) {
        submitFormButton.disabled = isSubmitting;
        submitFormButton.classList.toggle("is-submitting", isSubmitting);
      }

      if (submitFormTitle) {
        submitFormTitle.textContent = isSubmitting ? "Sending..." : defaultSubmitText;
      }
    };

    const validateForm = () => {
      clearFormErrors();

      const firstName = String(visionForm.elements.first_name.value || "").trim();
      const email = String(visionForm.elements.email.value || "").trim();
      const phone = String(visionForm.elements.phone.value || "").trim();
      const scope = String(visionForm.elements.vision_scope.value || "").trim();
      let isValid = true;
      const summaryErrors = [];

      if (!firstName) {
        setFieldError("first_name", "Please enter your name.");
        summaryErrors.push("Please enter your name.");
        isValid = false;
      }

      if (!email && !phone) {
        setFieldError("email", "Enter email or phone number.");
        setFieldError("phone", "Enter phone number or email.");
        summaryErrors.push("Please provide at least your email or your phone number.");
        isValid = false;
      } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError("email", "Please enter a valid email address.");
        summaryErrors.push("Please enter a valid email address.");
        isValid = false;
      }

      if (!scope) {
        setFieldError("vision_scope", "Please describe the scope of your vision or event.");
        summaryErrors.push("Please describe the scope of your vision or event.");
        isValid = false;
      }

      if (!isValid && visionFormStatus) {
        visionFormStatus.textContent = summaryErrors[0];
        visionFormStatus.classList.add("is-visible");
      }

      return isValid;
    };

    visionForm.addEventListener("submit", event => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      const formData = new FormData(visionForm);
      const firstName = String(formData.get("first_name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const scope = String(formData.get("vision_scope") || "").trim();
      const payload = {
        access_key: String(formData.get("access_key") || "").trim(),
        subject: `Vision / Event Inquiry from ${firstName || "Guest"}`,
        from_name: "MarmaSan Website",
        name: firstName,
        email,
        phone,
        vision_scope: scope,
        message: [
          `Name: ${firstName}`,
          `Email: ${email || "Not provided"}`,
          `Phone: ${phone || "Not provided"}`,
          "",
          "What is the scope of your Vision/Event?",
          scope
        ].join("\n"),
        botcheck: String(formData.get("botcheck") || "")
      };

      setSubmitting(true);

      fetch(web3FormsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(result => {
          if (!result.success) {
            throw new Error(result.message || "The form could not be sent.");
          }

          visionForm.reset();

          if (visionCount) {
            visionCount.textContent = "0";
          }

          clearFormErrors();
          setFormStatus("Your form was sent. I will contact you soon.", "success");
        })
        .catch(() => {
          setFormStatus("The form could not be sent right now. Please try again or contact me on WhatsApp or Instagram.");
        })
        .finally(() => {
          setSubmitting(false);
        });
    });

    ["first_name", "email", "phone", "vision_scope"].forEach(fieldName => {
      const field = visionForm.elements[fieldName];

      if (!field) {
        return;
      }

      field.addEventListener("input", () => {
        if (visionFormStatus?.classList.contains("is-visible")) {
          validateForm();
        } else {
          setFieldError(fieldName, "");
        }
      });
    });
  }

  if (contactPortal && contactVideo) {
    const playVideo = () => {
      const playAttempt = contactVideo.play();

      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    };

    const pauseVideo = () => {
      contactVideo.pause();
    };

    contactPortal.addEventListener("mouseenter", playVideo);
    contactPortal.addEventListener("focusin", playVideo);
    contactPortal.addEventListener("mouseleave", pauseVideo);
    contactPortal.addEventListener("focusout", () => {
      if (!contactPortal.matches(":hover")) {
        pauseVideo();
      }
    });
  }

  updateFocusedSection();
  updateForegroundDepth();
  window.addEventListener("scroll", () => {
    updateFocusedSection();
    requestForegroundDepthUpdate();
  }, { passive: true });
  window.addEventListener("resize", () => {
    updateFocusedSection();
    updateForegroundDepth();
  });

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
});
