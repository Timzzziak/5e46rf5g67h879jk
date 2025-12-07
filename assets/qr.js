var error = document.querySelector('.error')
var _scannerStream = null

function stopScanner() {
  try {
    // stop any MediaStream tracks
    if (_scannerStream) {
      _scannerStream.getTracks().forEach((t) => t.stop())
      _scannerStream = null
    }
  } catch (e) {
    console.warn('stopScanner stream error', e)
  }
  try {
    // stop Html5Qrcode if used
    if (window._html5QrScanner) {
      window._html5QrScanner.stop().catch(() => {})
      window._html5QrScanner = null
    }
  } catch (e) {
    console.warn('stopScanner html5qr error', e)
  }
  document.querySelector('.scanner_view')?.remove()
  document.querySelector('.qr_view')?.remove()
}
document.querySelectorAll('.action').forEach((_0x296273, _0x207928) => {
  _0x296273.addEventListener('click', () => {
    _0x207928 === 0 ? startScanner() : showQRCode()
  })
})
document.addEventListener('click', function (_0x2e5cc2) {
  if (_0x2e5cc2.target.classList.contains('close')) {
    // zatrzymaj ewentualny stream kamery i usuń widoki
    try {
      stopScanner()
    } catch (e) {}
    document.querySelector('.error')?.classList.remove('error_open')
    document.querySelector('.scanner_view')?.remove()
    document.querySelector('.qr_view')?.remove()
  }
})
function showQRCode() {
  const _0x4508d6 = document.createElement('div')
  _0x4508d6.className = 'qr_view'
  _0x4508d6.innerHTML =
    '\n        <p class="main_title">Pokaż kod QR osobie, której dokument sprawdzasz</p>\n        <p class="description">Gdy ta osoba zeskanuje lub wpisze kod, jej dane pojawią się na Twoim telefonie</p>\n        <div id="qrcode" style="margin: 20px auto;"></div>\n        <p class="code_number" id="code-number"></p>\n\n        <div class="timer_bar"><div id="time-bar"></div></div>\n        <p class="expires_text" id="expires-text"></p>\n\n        <div class="bottom-logos">\n            <div class="left-section">\n                <img src="https://i.imgur.com/1XtqkbK.gif" alt="Godło" class="left_logo">\n                <p class="logos_text">Rzeczpospolita <br>Polska</p>\n            </div>\n            <img src="https://i.imgur.com/PF3ac4i.gif" alt="Godło animated" class="right_logo">\n        </div>\n\n        <p class="error_button close">Zamknij</p>\n    '
  document.body.appendChild(_0x4508d6)
  const _0x62768b = Math.floor(100000 + Math.random() * 900000)
  document.getElementById('code-number').textContent = _0x62768b

  // przygotuj kontener qrcode i wygeneruj kod QR (bez kamery)
  const _qElem = document.getElementById('qrcode')
  _qElem.innerHTML = ''
  _qElem.style.display = 'flex'
  _qElem.style.alignItems = 'center'
  _qElem.style.justifyContent = 'center'

  const _qrContainer = document.createElement('div')
  _qrContainer.style.width = '200px'
  _qrContainer.style.height = '200px'
  _qElem.appendChild(_qrContainer)

  // generuj kod QR w dedykowanym kontenerze
  const _0x24e6af = new QRCode(_qrContainer, {
    text: _0x62768b.toString(),
    width: 200,
    height: 200,
  })
  let _0x4010a5 = 180
  const _0x3e4f5b = document.getElementById('time-bar'),
    _0x3276ae = document.getElementById('expires-text'),
    _0x5ea654 = setInterval(() => {
      _0x4010a5--
      _0x3e4f5b.style.width = (_0x4010a5 / 180) * 100 + '%'
      const _0x5991e1 = Math.floor(_0x4010a5 / 60),
        _0x17de2d = _0x4010a5 % 60
      _0x3276ae.innerHTML =
        'Kod wygaśnie za: <strong>' +
        _0x5991e1 +
        ' min ' +
        (_0x17de2d < 10 ? '0' + _0x17de2d : _0x17de2d) +
        ' sek</strong>.'
      _0x4010a5 <= 0 &&
        (clearInterval(_0x5ea654), (_0x3276ae.innerHTML = 'Kod wygasł.'))
    }, 1000)
}
function startScanner() {
  const _0x1eb920 = document.createElement('div')
  _0x1eb920.className = 'scanner_view'
  _0x1eb920.innerHTML =
    '\n        <div class="scanner_header">\n            <p class="back_link" onclick="document.querySelector(\'.scanner_view\')?.remove()">&lt; Kod QR          <p class="main_title">Kod QR</p>\n            <p class="help_icon">?</p>\n        </div>\n        <p class="description">Umieść kod QR w ramce, aby go zeskanować.</p>\n\n        <div class="scanner_wrapper">\n            <div class="warning">\n                <img src="https://i.imgur.com/hKfaBvw.png" style="width: 20px; vertical-align: middle; margin-right: 5px;">\n                Upewnij się, że kod QR pochodzi z wiarygodnego źródła.\n                <span class="close_warning" onclick="this.parentElement.style.display=\'none\'">\u2715</span>\n            </div>\n            <div id="reader" class="qr_reader"></div>\n        </div>\n\n        <button class="manual_button" onclick="showCodeInput()">Wpisz kod</button>\n\n    '
  document.body.appendChild(_0x1eb920)
  const reader = document.getElementById('reader')
  if (!reader) return

  // czyść ewentualne poprzednie elementy
  reader.innerHTML = ''

  const video = document.createElement('video')
  video.setAttribute('playsinline', true)
  video.style.width = '100%'
  video.style.height = '100%'
  video.style.objectFit = 'cover'

  const overlay = document.createElement('div')
  overlay.style.position = 'absolute'
  overlay.style.top = '12px'
  overlay.style.left = '12px'
  overlay.style.right = '12px'
  overlay.style.zIndex = '10'
  overlay.style.pointerEvents = 'none'
  overlay.style.color = '#fff'
  overlay.style.fontWeight = '600'

  const foundText = document.createElement('div')
  foundText.textContent = ''
  overlay.appendChild(foundText)

  // kontener z relative, aby overlay mogło być absolutne
  reader.style.position = 'relative'
  reader.appendChild(video)
  reader.appendChild(overlay)

  // dodaj elementy narożnikowe (dolne) — górne są pseudo-elementami w CSS
  const cornerBL = document.createElement('div')
  cornerBL.className = 'corner-bottom-left'
  const cornerBR = document.createElement('div')
  cornerBR.className = 'corner-bottom-right'
  reader.appendChild(cornerBL)
  reader.appendChild(cornerBR)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then((stream) => {
      _scannerStream = stream
      video.srcObject = stream
      video.play().catch(() => {})
      _scannerActive = true

      function tick() {
        if (!_scannerActive) return
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height)
            if (code) {
              foundText.textContent = 'Zeskanowano: ' + code.data
              // pokaż alert i zatrzymaj skanowanie
              setTimeout(() => {
                alert('Zeskanowany kod: ' + code.data)
                stopScanner()
              }, 100)
              return
            } else {
              foundText.textContent = ''
            }
          } catch (e) {
            console.error('scan tick error', e)
          }
        }
        requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    })
    .catch((err) => {
      console.warn('Kamera niedostępna:', err)
      const hint = document.createElement('div')
      hint.textContent = 'Brak dostępu do kamery'
      hint.style.color = '#a00'
      hint.style.fontSize = '14px'
      hint.style.marginTop = '12px'
      reader.appendChild(hint)
    })
}
function showCodeInput() {
  const _0x9ac679 = document.createElement('div')
  _0x9ac679.className = 'code_input_view'
  _0x9ac679.innerHTML =
    '\n        <div class="scanner_header">\n            <p class="main_title">Kod</p>\n            <p class="close_input" onclick="document.querySelector(\'.code_input_view\')?.remove()">Zamknij</p>\n        </div>\n        <p class="description">Wpisz lub wklej kod.</p>\n        <input class="code_input" type="text" maxlength="6" placeholder="|" oninput="this.value = this.value.replace(/[^0-9]/g, \'\').slice(0,6)">\n        <p class="input_hint">Wprowadź dokładnie 6 cyfr</p>\n        <button class="submit_code_button" disabled>Dalej</button>\n    '
  document.body.appendChild(_0x9ac679)
  const _0x4008c0 = _0x9ac679.querySelector('.code_input'),
    _0x42cd13 = _0x9ac679.querySelector('.submit_code_button')
  _0x4008c0.addEventListener('input', () => {
    _0x42cd13.disabled = _0x4008c0.value.length !== 6
  })
  _0x42cd13.addEventListener('click', () => {
    alert('Wprowadzony kod: ' + _0x4008c0.value)
    document.querySelector('.code_input_view')?.remove()
  })
}
