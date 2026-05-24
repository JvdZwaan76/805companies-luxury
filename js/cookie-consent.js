/*
 * 805 LifeGuard — Cookie Consent Banner & Preferences Manager
 * Self-hosted CCPA/CPRA-compliant consent UI
 * Version: 1.0.0
 *
 * What this script does:
 *   1. Renders a bottom banner on first visit (no consent stored)
 *   2. Provides a preferences modal (toggles for Analytics / Advertising)
 *   3. Provides a "Do Not Sell or Share" one-click opt-out
 *   4. Honors GPC (Global Privacy Control) — auto opt-out, no banner
 *   5. Persists consent in localStorage and reapplies on every page load
 *   6. Pushes Google Consent Mode v2 updates via window.gtag/dataLayer
 *
 * Pairs with: the inline default-deny snippet placed BEFORE GTM in <head>.
 * That snippet sets the initial 'denied' state; this script's job is to
 * update it after the user makes a choice.
 *
 * Exposes on window:
 *   window.openPrivacyPreferences()  — open the preferences modal
 *   window.doNotSellMyInfo()         — one-click opt-out (CCPA/CPRA §1798.135)
 *   window.cc                        — diagnostics: { getConsent, reset, version }
 */

(function () {
    'use strict';

    // -----------------------------------------------------------
    // CONFIG
    // -----------------------------------------------------------
    var CONFIG = {
        version: '1.0.0',
        storageKey: '805_consent_v1',
        privacyPolicyUrl: '/privacy',
        // Brand / copy
        companyName: '805 LifeGuard',
        // Categories shown in the preferences modal
        categories: [
            {
                id: 'necessary',
                name: 'Strictly Necessary',
                desc: 'Required for the website to function — site security, load balancing, and remembering your consent choices. Cannot be disabled.',
                locked: true,
                defaultOn: true
            },
            {
                id: 'analytics',
                name: 'Analytics',
                desc: 'Help us understand how visitors use the site (Google Analytics 4) so we can improve performance and content. IP addresses are anonymized.',
                locked: false,
                defaultOn: false
            },
            {
                id: 'advertising',
                name: 'Advertising & Personalization',
                desc: 'Used to measure ad performance and personalize content across Google services. Disabling this is the same as exercising your right to opt out of the sale/sharing of personal information under CCPA/CPRA.',
                locked: false,
                defaultOn: false
            }
        ]
    };

    // -----------------------------------------------------------
    // STORAGE HELPERS (safe — wrapped, no throws)
    // -----------------------------------------------------------
    function getStored() {
        try {
            var raw = window.localStorage.getItem(CONFIG.storageKey);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (parsed && parsed.version === CONFIG.version) return parsed;
            return null;
        } catch (e) {
            return null;
        }
    }

    function setStored(state) {
        try {
            var record = {
                version: CONFIG.version,
                timestamp: new Date().toISOString(),
                necessary: true,
                analytics: !!state.analytics,
                advertising: !!state.advertising,
                source: state.source || 'user'
            };
            window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(record));
            return record;
        } catch (e) {
            return null;
        }
    }

    function clearStored() {
        try { window.localStorage.removeItem(CONFIG.storageKey); }
        catch (e) { /* noop */ }
    }

    // -----------------------------------------------------------
    // CONSENT APPLICATION (Google Consent Mode v2)
    // -----------------------------------------------------------
    function applyConsent(state) {
        window.dataLayer = window.dataLayer || [];

        // Local gtag shim — uses existing one if present, otherwise pushes to dataLayer
        var gtagFn = window.gtag || function () { window.dataLayer.push(arguments); };

        gtagFn('consent', 'update', {
            'ad_storage':         state.advertising ? 'granted' : 'denied',
            'ad_user_data':       state.advertising ? 'granted' : 'denied',
            'ad_personalization': state.advertising ? 'granted' : 'denied',
            'analytics_storage':  state.analytics   ? 'granted' : 'denied'
        });

        // Custom dataLayer event so GTM tags can react
        window.dataLayer.push({
            event: 'consent_update',
            consent: {
                necessary:   true,
                analytics:   !!state.analytics,
                advertising: !!state.advertising,
                source:      state.source || 'user'
            }
        });
    }

    // -----------------------------------------------------------
    // GPC DETECTION (Global Privacy Control — CPRA §7025)
    // -----------------------------------------------------------
    function hasGPC() {
        try { return navigator.globalPrivacyControl === true; }
        catch (e) { return false; }
    }

    // -----------------------------------------------------------
    // DOM BUILDING
    // -----------------------------------------------------------
    function makeEl(tag, attrs, children) {
        var el = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'class') el.className = attrs[k];
                else if (k === 'html') el.innerHTML = attrs[k];
                else if (k === 'text') el.textContent = attrs[k];
                else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
                    el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
                } else if (attrs[k] !== null && attrs[k] !== undefined) {
                    el.setAttribute(k, attrs[k]);
                }
            });
        }
        if (children) {
            children.forEach(function (c) {
                if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
            });
        }
        return el;
    }

    var rootEl = null;
    var bannerEl = null;
    var modalOverlayEl = null;
    var modalEl = null;
    var toastEl = null;
    var lastFocusedBeforeModal = null;

    function ensureRoot() {
        if (rootEl) return rootEl;
        rootEl = makeEl('div', { class: 'cc-root', id: 'cc-root' });
        document.body.appendChild(rootEl);
        return rootEl;
    }

    // -----------------------------------------------------------
    // BANNER
    // -----------------------------------------------------------
    function buildBanner() {
        if (bannerEl) return bannerEl;

        var content = makeEl('div', { class: 'cc-banner-content' }, [
            makeEl('h2', {
                class: 'cc-banner-title',
                id: 'cc-banner-title',
                text: 'Your Privacy Matters'
            }),
            makeEl('p', {
                class: 'cc-banner-text',
                html: 'We use cookies and similar technologies to analyze site traffic and improve our services. ' +
                      'Under California law (CCPA/CPRA), you have the right to opt out of the sale or sharing of your personal information. ' +
                      'Learn more in our <a href="' + CONFIG.privacyPolicyUrl + '">Privacy Policy</a>.'
            })
        ]);

        var actions = makeEl('div', { class: 'cc-banner-actions' }, [
            makeEl('button', {
                class: 'cc-btn cc-btn-link',
                type: 'button',
                'data-cc-action': 'preferences',
                text: 'Manage Preferences',
                onClick: openModal
            }),
            makeEl('button', {
                class: 'cc-btn cc-btn-secondary',
                type: 'button',
                'data-cc-action': 'reject',
                text: 'Reject All',
                onClick: function () { acceptOrReject(false); }
            }),
            makeEl('button', {
                class: 'cc-btn cc-btn-primary',
                type: 'button',
                'data-cc-action': 'accept',
                text: 'Accept All',
                onClick: function () { acceptOrReject(true); }
            })
        ]);

        var inner = makeEl('div', { class: 'cc-banner-inner' }, [content, actions]);

        bannerEl = makeEl('div', {
            class: 'cc-banner',
            role: 'dialog',
            'aria-modal': 'false',
            'aria-labelledby': 'cc-banner-title',
            'aria-describedby': 'cc-banner-text'
        }, [inner]);

        ensureRoot().appendChild(bannerEl);
        return bannerEl;
    }

    function showBanner() {
        buildBanner();
        // next tick so transition applies
        requestAnimationFrame(function () {
            bannerEl.classList.add('cc-visible');
        });
    }

    function hideBanner() {
        if (!bannerEl) return;
        bannerEl.classList.remove('cc-visible');
        // remove from DOM after transition
        setTimeout(function () {
            if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
            bannerEl = null;
        }, 400);
    }

    function acceptOrReject(accept) {
        var state = {
            analytics:   accept,
            advertising: accept,
            source: accept ? 'accept_all' : 'reject_all'
        };
        setStored(state);
        applyConsent(state);
        hideBanner();
    }

    // -----------------------------------------------------------
    // PREFERENCES MODAL
    // -----------------------------------------------------------
    function buildModal() {
        if (modalOverlayEl) return modalOverlayEl;

        var header = makeEl('div', { class: 'cc-modal-header' }, [
            makeEl('h2', {
                class: 'cc-modal-title',
                id: 'cc-modal-title',
                text: 'Privacy Preferences'
            }),
            makeEl('button', {
                class: 'cc-modal-close',
                type: 'button',
                'aria-label': 'Close',
                html: '&times;',
                onClick: closeModal
            })
        ]);

        var intro = makeEl('p', {
            class: 'cc-modal-intro',
            html: 'Choose which categories of cookies and tracking technologies we may use. ' +
                  'You can change these settings at any time from the footer of any page. ' +
                  'For full details, see our <a href="' + CONFIG.privacyPolicyUrl + '">Privacy Policy</a>.'
        });

        var categoriesEl = makeEl('div', { class: 'cc-categories' });
        var current = getStored() || {};

        CONFIG.categories.forEach(function (cat) {
            var checked = cat.locked ? true :
                (cat.id in current ? !!current[cat.id] : cat.defaultOn);

            var inputAttrs = {
                type: 'checkbox',
                'data-cc-cat': cat.id,
                id: 'cc-cat-' + cat.id
            };
            if (checked) inputAttrs.checked = 'checked';
            if (cat.locked) inputAttrs.disabled = 'disabled';

            var input = makeEl('input', inputAttrs);

            var toggle = makeEl('label', {
                class: 'cc-toggle',
                'aria-label': cat.name + ' (toggle)'
            }, [
                input,
                makeEl('span', { class: 'cc-toggle-slider', 'aria-hidden': 'true' })
            ]);

            var headerRow = makeEl('div', { class: 'cc-category-header' }, [
                makeEl('div', {}, [
                    makeEl('h3', { class: 'cc-category-name', text: cat.name }),
                    cat.locked ? makeEl('span', {
                        class: 'cc-toggle-locked-label',
                        text: 'Always Active'
                    }) : null
                ]),
                toggle
            ]);

            var row = makeEl('div', { class: 'cc-category' }, [
                headerRow,
                makeEl('p', { class: 'cc-category-desc', text: cat.desc })
            ]);

            categoriesEl.appendChild(row);
        });

        var body = makeEl('div', { class: 'cc-modal-body' }, [intro, categoriesEl]);

        var footer = makeEl('div', { class: 'cc-modal-footer' }, [
            makeEl('button', {
                class: 'cc-btn cc-btn-link',
                type: 'button',
                text: 'Reject All',
                onClick: function () {
                    // uncheck non-locked toggles
                    modalEl.querySelectorAll('input[data-cc-cat]:not([disabled])').forEach(function (i) {
                        i.checked = false;
                    });
                    saveFromModal('reject_all');
                }
            }),
            makeEl('button', {
                class: 'cc-btn cc-btn-secondary',
                type: 'button',
                text: 'Accept All',
                onClick: function () {
                    modalEl.querySelectorAll('input[data-cc-cat]:not([disabled])').forEach(function (i) {
                        i.checked = true;
                    });
                    saveFromModal('accept_all');
                }
            }),
            makeEl('button', {
                class: 'cc-btn cc-btn-primary',
                type: 'button',
                text: 'Save Preferences',
                onClick: function () { saveFromModal('save_prefs'); }
            })
        ]);

        modalEl = makeEl('div', {
            class: 'cc-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'cc-modal-title'
        }, [header, body, footer]);

        modalOverlayEl = makeEl('div', {
            class: 'cc-modal-overlay',
            onClick: function (e) {
                if (e.target === modalOverlayEl) closeModal();
            }
        }, [modalEl]);

        ensureRoot().appendChild(modalOverlayEl);
        return modalOverlayEl;
    }

    function openModal() {
        // Rebuild every time so toggle state reflects current storage
        if (modalOverlayEl && modalOverlayEl.parentNode) {
            modalOverlayEl.parentNode.removeChild(modalOverlayEl);
            modalOverlayEl = null;
            modalEl = null;
        }
        buildModal();
        lastFocusedBeforeModal = document.activeElement;

        requestAnimationFrame(function () {
            modalOverlayEl.classList.add('cc-visible');
            // Focus first interactive control
            var firstBtn = modalEl.querySelector('.cc-modal-close');
            if (firstBtn) firstBtn.focus();
        });

        document.addEventListener('keydown', onModalKeydown);
    }

    function closeModal() {
        if (!modalOverlayEl) return;
        modalOverlayEl.classList.remove('cc-visible');
        document.removeEventListener('keydown', onModalKeydown);
        setTimeout(function () {
            if (modalOverlayEl && modalOverlayEl.parentNode) {
                modalOverlayEl.parentNode.removeChild(modalOverlayEl);
            }
            modalOverlayEl = null;
            modalEl = null;
            if (lastFocusedBeforeModal && lastFocusedBeforeModal.focus) {
                lastFocusedBeforeModal.focus();
            }
        }, 300);
    }

    function onModalKeydown(e) {
        if (e.key === 'Escape') {
            closeModal();
            return;
        }
        // Simple focus trap
        if (e.key === 'Tab' && modalEl) {
            var focusable = modalEl.querySelectorAll(
                'button, [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    function saveFromModal(source) {
        var state = { source: source };
        modalEl.querySelectorAll('input[data-cc-cat]').forEach(function (i) {
            state[i.getAttribute('data-cc-cat')] = i.checked;
        });
        setStored(state);
        applyConsent(state);
        hideBanner();
        closeModal();
        showToast('Your preferences have been saved.');
    }

    // -----------------------------------------------------------
    // TOAST
    // -----------------------------------------------------------
    function showToast(msg) {
        // Remove existing toast if present
        if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);

        toastEl = makeEl('div', {
            class: 'cc-toast',
            role: 'status',
            'aria-live': 'polite',
            text: msg
        });
        ensureRoot().appendChild(toastEl);

        requestAnimationFrame(function () { toastEl.classList.add('cc-visible'); });
        setTimeout(function () {
            if (toastEl) toastEl.classList.remove('cc-visible');
            setTimeout(function () {
                if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
                toastEl = null;
            }, 300);
        }, 3500);
    }

    // -----------------------------------------------------------
    // PUBLIC API
    // -----------------------------------------------------------
    window.openPrivacyPreferences = function () {
        openModal();
        return false;  // for inline onclick="return ..."
    };

    window.doNotSellMyInfo = function () {
        var state = {
            analytics:   false,
            advertising: false,
            source:      'do_not_sell'
        };
        setStored(state);
        applyConsent(state);
        hideBanner();
        showToast('Your opt-out preference has been saved. We will not sell or share your personal information.');
        return false;
    };

    // Diagnostics / dev tools
    window.cc = {
        version: CONFIG.version,
        getConsent: getStored,
        reset: function () {
            clearStored();
            location.reload();
        },
        openModal: openModal
    };

    // -----------------------------------------------------------
    // INIT
    // -----------------------------------------------------------
    function init() {
        var stored = getStored();
        var gpc = hasGPC();

        if (gpc) {
            // GPC is a valid opt-out signal under CPRA §7025 — honor it silently.
            // We still record the opt-out so it survives in localStorage.
            var gpcState = {
                analytics:   false,
                advertising: false,
                source:      'gpc'
            };
            // Only write storage if not already in opt-out state (avoid overwriting user's explicit accept)
            if (!stored) {
                setStored(gpcState);
                applyConsent(gpcState);
            } else if (stored.advertising || stored.analytics) {
                // User had previously accepted, but GPC is now signaled — defer to GPC for this session
                applyConsent(gpcState);
            }
            // Do not show banner — GPC counts as a clear opt-out signal
            return;
        }

        if (stored) {
            // Reapply stored consent on every page load (default-deny snippet
            // already ran inline; this re-asserts the user's actual choices).
            applyConsent(stored);
            return;
        }

        // No stored consent and no GPC — show banner
        showBanner();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
