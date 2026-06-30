(function() {
  'use strict';

  var scriptEl = document.currentScript;
  var BASE = '/';
  if (scriptEl && scriptEl.src) {
    BASE = scriptEl.src.replace(/js\/attachment-preview\.js(\?.*)?$/, '');
  }

  var ASSETS_RE = /\/assets\/files\/.*\.(pdf|pptx|ppt|xlsx|xls)$/i;
  var HELP_CENTER_RE = /\/files\/help-center\//;

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {
      return value;
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function withBase(url) {
    if (!url) return url;
    if (/^(?:[a-z]+:)?\/\//i.test(url)) return url;
    if (url.charAt(0) === '/') {
      return BASE.replace(/\/$/, '') + url;
    }
    return BASE + url.replace(/^\.\//, '');
  }

  function isAttachmentLink(href) {
    if (!href) return false;
    return HELP_CENTER_RE.test(href) || ASSETS_RE.test(href);
  }

  function getFileType(href) {
    var ext = (href.match(/\.(\w+)$/) || [])[1] || '';
    ext = ext.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'pptx' || ext === 'ppt') return 'pptx';
    if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
    return 'unknown';
  }

  function getFileName(link) {
    return (link.textContent || '').trim() || safeDecode((link.href.match(/[^/]+$/) || ['file'])[0]);
  }

  function cleanFileName(fileName) {
    return safeDecode(fileName || 'download')
      .replace(/[\/\\:*?"<>|]/g, '_')
      .replace(/[\x00-\x1f]/g, '')
      .trim() || 'download';
  }

  function setCardFileName(card, fileName) {
    var cleanName = cleanFileName(fileName);
    var nameEl = card.querySelector('.att-name');
    var dlEl = card.querySelector('.att-download');
    [nameEl, dlEl].forEach(function(el) {
      if (!el) return;
      el.setAttribute('download', cleanName);
      el.setAttribute('data-att-file-name', cleanName);
    });
    if (nameEl) nameEl.textContent = cleanName;
  }

  function forceDownload(event) {
    var link = event.currentTarget;
    var href = link.getAttribute('href');
    var fileName = link.getAttribute('data-att-file-name') || link.getAttribute('download') || getFileName(link);
    if (!href) return;
    event.preventDefault();

    fetch(href)
      .then(function(response) {
        if (!response.ok) throw new Error('download failed');
        return response.blob();
      })
      .then(function(blob) {
        var blobUrl = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = blobUrl;
        a.download = cleanFileName(fileName);
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 1000);
      })
      .catch(function() {
        var a = document.createElement('a');
        a.href = href;
        a.download = cleanFileName(fileName);
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }

  function getManifestUrl(fileHref) {
    var match = fileHref.match(/\/files\/help-center\/([^/]+)\/([^/]+)$/);
    if (!match) return null;
    var slug = match[1];
    var fileName = safeDecode(match[2]);
    var sanitized = fileName.replace(/[\/\\:*?"<>|]/g, '_').replace(/[\x00-\x1f]/g, '').slice(0, 100);
    var ext = fileName.split('.').pop().toLowerCase();
    var prefix = ext === 'pptx' || ext === 'ppt' ? 'ppt-' : '';
    return encodeURI(BASE + 'img/help-center/' + slug + '/' + prefix + sanitized + '/manifest.json');
  }

  function createCard(type, href, fileName) {
    var icons = { pdf: 'PDF', pptx: 'PPT', xlsx: 'XLS', unknown: 'FILE' };
    var colors = { pdf: '#dc2626', pptx: '#ea580c', xlsx: '#16a34a', unknown: '#6b7280' };
    var card = document.createElement('div');
    card.className = 'att-card';
    var safeName = escapeHtml(fileName);
    var safeHref = escapeHtml(href);
    card.innerHTML =
      '<div class="att-body"></div>' +
      '<div class="att-footer">' +
        '<span class="att-badge" style="background:' + colors[type] + '">' + icons[type] + '</span>' +
        '<a class="att-name" href="' + safeHref + '" download="' + safeName + '" data-att-file-name="' + safeName + '">' + safeName + '</a>' +
        '<a class="att-download" href="' + safeHref + '" download="' + safeName + '" data-att-file-name="' + safeName + '">\u4e0b\u8f7d</a>' +
      '</div>' +
      '<div class="att-status" style="display:none"></div>';
    card.querySelector('.att-name').addEventListener('click', forceDownload);
    card.querySelector('.att-download').addEventListener('click', forceDownload);
    return card;
  }

  function loadScript(src) {
    return new Promise(function(ok, fail) {
      var existing = document.querySelector('script[data-att-vendor="' + src + '"]');
      if (existing) { ok(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.setAttribute('data-att-vendor', src);
      s.onload = ok;
      s.onerror = fail;
      document.head.appendChild(s);
    });
  }

  function toggleCard(card, type, href) {
    var toggle = card.querySelector('.att-toggle');
    var body = card.querySelector('.att-body');
    var isOpen = !body.classList.contains('collapsed');
    if (isOpen) {
      body.classList.add('collapsed');
      toggle.textContent = 'Preview';
    } else {
      body.classList.remove('collapsed');
      toggle.textContent = 'Collapse';
      if (!body.hasChildNodes() || body.dataset.loaded !== 'true') {
        renderPreview(card, type, href);
        body.dataset.loaded = 'true';
      }
    }
  }

  function renderPreview(card, type, href) {
    if (type === 'pdf') showPDF(card, href);
    else if (type === 'pptx') showPPTX(card, href);
    else if (type === 'xlsx') showXLSX(card, href);
    else {
      var body = card.querySelector('.att-body');
      body.innerHTML = '<p style="padding:12px;color:#666">This file type cannot be previewed. Please download.</p>';
    }
  }

  function showPDF(card, url) {
    var body = card.querySelector('.att-body');
    body.classList.add('att-body--preview');
    body.innerHTML = '<p style="text-align:center;color:#666;padding:20px">Loading PDF...</p>';
    loadScript(BASE + 'js/vendor/pdf.min.js')
      .then(function() {
        pdfjsLib.GlobalWorkerOptions.workerSrc = BASE + 'js/vendor/pdf.worker.min.js';
        return pdfjsLib.getDocument(url).promise;
      })
      .then(function(pdf) {
        body.innerHTML = '';
        var total = pdf.numPages;
        var info = document.createElement('p');
        info.className = 'att-page-count';
        info.textContent = '\u5171 ' + total + ' \u9875\uff0c\u5df2\u5168\u90e8\u52a0\u8f7d';
        body.appendChild(info);

        function renderPage(pageNumber) {
          if (pageNumber > total) return Promise.resolve();
          return pdf.getPage(pageNumber).then(function(page) {
            var w = body.clientWidth || 800;
            var vp = page.getViewport({ scale: 1 });
            var scale = w / vp.width;
            vp = page.getViewport({ scale: scale });
            var c = document.createElement('canvas');
            c.width = vp.width;
            c.height = vp.height;
            c.style.cssText = 'width:100%;height:auto;margin:0 auto 10px';
            body.appendChild(c);
            return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          }).then(function() {
            return renderPage(pageNumber + 1);
          });
        }

        return renderPage(1);
      })
      .catch(function() {
        body.classList.add('collapsed');
        var st = card.querySelector('.att-status');
        st.style.display = 'block';
        st.innerHTML = '<span style="color:#dc2626">Preview failed. Please download the file.</span>';
      });
  }

  function showPptxWithManifest(card, manifest) {
    var body = card.querySelector('.att-body');
    body.innerHTML = '';
    body.classList.add('att-body--preview');

    var slideImages = manifest.slideImages || manifest.slides || [];
    if (slideImages && slideImages.length > 0) {
      var list = document.createElement('div');
      list.className = 'att-slide-list';
      slideImages.forEach(function(imgUrl, index) {
        var slide = document.createElement('figure');
        slide.className = 'att-slide';
        var slideImg = document.createElement('img');
        slideImg.src = withBase(imgUrl);
        slideImg.alt = 'Slide ' + (index + 1);
        slideImg.loading = 'lazy';
        slide.appendChild(slideImg);
        list.appendChild(slide);
      });
      body.appendChild(list);
    } else if (manifest.thumbnailUrl) {
      var coverDiv = document.createElement('div');
      coverDiv.className = 'att-cover';
      var img = document.createElement('img');
      img.src = withBase(manifest.thumbnailUrl);
      img.alt = (manifest.originalFileName || manifest.displayName || manifest.fileName) + ' cover';
      img.style.maxWidth = '100%';
      coverDiv.appendChild(img);
      body.appendChild(coverDiv);

      var note = document.createElement('p');
      note.className = 'att-page-count';
      note.textContent = '\u5df2\u663e\u793a\u5c01\u9762\u9884\u89c8\uff0c\u5b8c\u6574\u5185\u5bb9\u8bf7\u4e0b\u8f7d\u9644\u4ef6\u67e5\u770b';
      body.appendChild(note);
    }
  }

  function findThumbnailImg(card) {
    var container = card.closest('article') || card.closest('.theme-doc-markdown') || card.parentElement;
    if (!container) return null;
    var imgs = container.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var src = imgs[i].getAttribute('src') || '';
      if (src.indexOf('thumbnail') !== -1) return imgs[i];
    }
    return null;
  }

  function showPPTX(card, url) {
    var body = card.querySelector('.att-body');
    body.classList.add('att-body--preview');
    body.innerHTML = '<p style="text-align:center;color:#666;padding:20px">Loading PPT...</p>';

    var manifestUrl = getManifestUrl(url);
    var manifestPromise = manifestUrl
      ? fetch(manifestUrl).then(function(r) {
          if (!r.ok) throw new Error('manifest not found');
          return r.json();
        })
      : Promise.reject(new Error('no manifest url'));

    manifestPromise
      .then(function(manifest) {
        var displayName = manifest.originalFileName || manifest.displayName || manifest.fileName;
        if (displayName) setCardFileName(card, displayName);
        if (manifest && (manifest.thumbnailUrl || (manifest.slideImages && manifest.slideImages.length > 0) || (manifest.slides && manifest.slides.length > 0))) {
          showPptxWithManifest(card, manifest);
        } else {
          throw new Error('manifest has no images');
        }
      })
      .catch(function(error) {
        console.warn('Attachment PPT preview fell back to runtime renderer.', error);
        body.innerHTML = '<p style="text-align:center;color:#666;padding:20px">Loading PPT...</p>';
        loadScript(BASE + 'js/vendor/pptx-preview.umd.js')
          .then(function() {
            body.innerHTML = '';
            var box = document.createElement('div');
            box.style.cssText = 'width:100%;min-height:300px';
            body.appendChild(box);
            return fetch(url).then(function(r) { return r.arrayBuffer(); }).then(function(buf) {
              var pv = PptxPreview.init(box, {
                width: box.offsetWidth || 800,
                height: Math.min((box.offsetWidth || 800) * 0.5625, 600),
                mode: 'list'
              });
              return pv.preview(buf);
            });
          })
          .catch(function() {
            body.innerHTML = '';
            var thumb = findThumbnailImg(card);
            if (thumb) {
              var clone = thumb.cloneNode(true);
              clone.style.cssText = 'max-width:100%;height:auto;border-radius:4px;margin-bottom:8px';
              body.appendChild(clone);
              var note = document.createElement('p');
              note.style.cssText = 'text-align:center;color:#666;font-size:12px;padding:4px';
              note.textContent = 'Slide preview (thumbnail). Download the file for full content.';
              body.appendChild(note);
            } else {
              body.classList.add('collapsed');
              var st = card.querySelector('.att-status');
              st.style.display = 'block';
              st.innerHTML = '<span style="color:#dc2626">Preview unavailable. Please download the file.</span>';
            }
          });
      });
  }

  function showXLSX(card, url) {
    var body = card.querySelector('.att-body');
    body.classList.add('att-body--preview');
    body.innerHTML = '<p style="text-align:center;color:#666;padding:20px">Loading Excel...</p>';
    loadScript(BASE + 'js/vendor/xlsx.full.min.js')
      .then(function() {
        return fetch(url).then(function(r) { return r.arrayBuffer(); });
      })
      .then(function(buf) {
        var wb = XLSX.read(buf, { type: 'array' });
        body.innerHTML = '';
        var names = wb.SheetNames;
        if (names.length > 1) {
          var tabs = document.createElement('div');
          tabs.className = 'att-tabs';
          names.forEach(function(nm, i) {
            var b = document.createElement('button');
            b.textContent = nm;
            if (i === 0) b.className = 'active';
            b.onclick = function() {
              tabs.querySelectorAll('button').forEach(function(x) { x.className = ''; });
              b.className = 'active';
              render(wb.Sheets[nm]);
            };
            tabs.appendChild(b);
          });
          body.appendChild(tabs);
        }
        var tbl = document.createElement('div');
        tbl.className = 'att-table-wrap';
        body.appendChild(tbl);
        function render(sheet) {
          var range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
          var lastRow = Math.min(range.e.r, range.s.r + 10);
          var orig = sheet['!ref'];
          sheet['!ref'] = XLSX.utils.encode_col(range.s.c) + (range.s.r + 1) + ':' +
            XLSX.utils.encode_col(range.e.c) + (lastRow + 1);
          tbl.innerHTML = XLSX.utils.sheet_to_html(sheet);
          sheet['!ref'] = orig;
          if (range.e.r - range.s.r > 10) {
            var p = document.createElement('p');
            p.style.cssText = 'text-align:center;color:#999;font-size:12px;padding:6px;border-top:1px solid #e5e7eb';
            p.textContent = 'Showing 10 of ' + (range.e.r - range.s.r + 1) + ' rows';
            tbl.appendChild(p);
          }
        }
        render(wb.Sheets[names[0]]);
      })
      .catch(function() {
        body.classList.add('collapsed');
        var st = card.querySelector('.att-status');
        st.style.display = 'block';
        st.innerHTML = '<span style="color:#dc2626">Preview failed. Please download the file.</span>';
      });
  }

  function enhance() {
    document.querySelectorAll('.theme-doc-markdown a[href]').forEach(function(link) {
      if (link.getAttribute('data-att-enhanced') === 'true') return;
      var href = link.getAttribute('href') || '';
      if (!isAttachmentLink(href)) return;
      if (link.closest('.att-card')) return;

      link.setAttribute('data-att-enhanced', 'true');

      var type = getFileType(href);
      var name = getFileName(link);
      var card = createCard(type, href, name);

      var parent = link.parentElement;
      if (parent && parent.tagName === 'P' && parent.childNodes.length === 1) {
        parent.replaceWith(card);
      } else {
        link.replaceWith(card);
      }

      renderPreview(card, type, href);
    });
  }

  var observerStarted = false;

  function startObserver() {
    if (observerStarted) return;
    if (!document.body) {
      setTimeout(startObserver, 50);
      return;
    }
    observerStarted = true;
    new MutationObserver(function(muts) {
      var found = false;
      muts.forEach(function(m) {
        m.addedNodes.forEach(function(n) {
          if (n.nodeType !== 1) return;
          if (n.matches && n.matches('.theme-doc-markdown a[href]')) found = true;
          if (n.querySelector && n.querySelector('.theme-doc-markdown a[href]')) found = true;
        });
      });
      if (found) setTimeout(enhance, 100);
    }).observe(document.body, { childList: true, subtree: true });
  }

  var css = document.createElement('style');
  css.textContent = [
    '.att-card{border:1px solid #e5e7eb;border-radius:8px;margin:16px 0;overflow:hidden;background:#fff;font-family:system-ui,sans-serif;max-width:860px}',
    '.att-body{background:#fff}',
    '.att-body.att-body--preview{max-height:560px;overflow:auto}',
    '.att-body.collapsed{display:none}',
    '.att-body>p{margin:0;text-align:center;color:#666;padding:20px}',
    '.att-body canvas{display:block;width:100%;height:auto;margin:0 auto 8px;background:#fff}',
    '.att-footer{display:flex;align-items:center;gap:8px;padding:9px 14px;background:#fff;border-top:1px solid #e5e7eb}',
    '.att-badge{color:#fff;font-size:10px;font-weight:700;line-height:1;padding:3px 5px;border-radius:2px;flex-shrink:0}',
    '.att-name{font-size:13px;font-weight:500;line-height:1.4;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;text-decoration:none}',
    '.att-name:hover{color:#02983b;text-decoration:none}',
    '.att-download{font-size:12px;color:#02983b;text-decoration:none;white-space:nowrap}',
    '.att-download:hover{text-decoration:underline}',
    '.att-status{padding:8px 16px;font-size:12px}',
    '.att-page-count{margin:0!important;text-align:center;color:#8a8f98!important;font-size:12px!important;padding:8px 0!important;background:#fff;position:sticky;top:0;z-index:1;border-bottom:1px solid #f1f5f9}',
    '.att-cover{text-align:center;background:#fff}',
    '.theme-doc-markdown .att-cover img{display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:0;box-shadow:none;margin:0 auto}',
    '.att-slide-list{display:flex;flex-direction:column;gap:0;padding:0;background:#fff}',
    '.att-slide{margin:0;background:#fff;border-bottom:1px solid #e5e7eb}',
    '.theme-doc-markdown .att-slide img{display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:0;box-shadow:none;margin:0 auto}',
    '.att-media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}',
    '.att-media-grid img{width:100%;border-radius:4px;border:1px solid #e5e7eb;cursor:pointer}',
    '.att-tabs{display:flex;gap:4px;margin-bottom:8px;border-bottom:1px solid #e5e7eb}',
    '.att-tabs button{background:none;border:none;padding:6px 12px;font-size:13px;cursor:pointer;color:#6b7280}',
    '.att-tabs button.active{color:#1d4ed8;border-bottom:2px solid #1d4ed8;font-weight:500}',
    '.att-table-wrap{overflow:auto;max-height:480px}',
    '.att-table-wrap table{width:100%;border-collapse:collapse;font-size:13px}',
    '.att-table-wrap td,.att-table-wrap th{border:1px solid #e5e7eb;padding:4px 8px;white-space:nowrap}',
    '.att-table-wrap th{background:#f9fafb;font-weight:500}'
  ].join('\n');
  document.head.appendChild(css);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      enhance();
      startObserver();
    });
  } else {
    enhance();
    startObserver();
  }
  document.addEventListener('routeUpdate', function() {
    setTimeout(enhance, 0);
    startObserver();
  });
})();
