const HAFIZA_URUN = "ertu_fiyat_urunler_v4";
const HAFIZA_KULLANICI = "ertu_fiyat_kullanicilar_v4";
const HAFIZA_SIFRE = "ertu_fiyat_admin_sifre_v4";

const VARSAYILAN_KULLANICILAR = new Array(
    { id: "yonetici", ad: "Yönetici (Tüm Fiyatlar)", sifre: "1234", alis: true, f1: true, f2: true, f3: true, f4: true },
    { id: "plasiyer", ad: "Satış Personeli (Satış 1)", sifre: "1111", alis: false, f1: true, f2: false, f3: false, f4: false }
);

let urunler = JSON.parse(localStorage.getItem(HAFIZA_URUN)) || new Array();
let kullanicilar = JSON.parse(localStorage.getItem(HAFIZA_KULLANICI)) || VARSAYILAN_KULLANICILAR;
let adminSifre = localStorage.getItem(HAFIZA_SIFRE) || "1234";

let aktifKullanici = null;
let yonetimAcik = false;

function verileriKaydet() {
    localStorage.setItem(HAFIZA_URUN, JSON.stringify(urunler));
    localStorage.setItem(HAFIZA_KULLANICI, JSON.stringify(kullanicilar));
}

function girisListesiniDoldur() {
    const sec = document.getElementById('girisKullaniciSec');
    sec.innerHTML = kullanicilar.map(k => `<option value="${k.id}">${k.ad}</option>`).join('');
}

function girisYap() {
    const secilenId = document.getElementById('girisKullaniciSec').value;
    const girilenSifre = document.getElementById('girisSifreInput').value.trim();
    const kullanici = kullanicilar.find(k => k.id === secilenId);

    if (!kullanici || kullanici.sifre !== girilenSifre) {
        document.getElementById('girisHata').innerText = "Hatalı şifre! Tekrar deneyin.";
        return;
    }

    aktifKullanici = kullanici;
    yonetimAcik = false;
    document.getElementById('yonetimPaneli').style.display = 'none';
    document.getElementById('btnYonetim').innerText = 'Yönetim';
    document.getElementById('girisHata').innerText = '';
    document.getElementById('girisSifreInput').value = '';
    document.getElementById('girisEkrani').style.display = 'none';
    document.getElementById('anaEkran').style.display = 'block';
    document.getElementById('aktifKullaniciEtiket').innerText = kullanici.ad;

    tabloyuGuncelle();
}

function cikisYap() {
    aktifKullanici = null;
    yonetimAcik = false;
    document.getElementById('anaEkran').style.display = 'none';
    document.getElementById('girisEkrani').style.display = 'flex';
    girisListesiniDoldur();
}

function yonetimPaneliAcKapat() {
    if (!yonetimAcik) {
        const sifre = prompt("Yönetim Şifresini Girin:");
        if (sifre === null) return;
        if (sifre !== adminSifre) {
            alert("Hatalı yönetim şifresi!");
            return;
        }
        yonetimAcik = true;
        document.getElementById('yonetimPaneli').style.display = 'block';
        document.getElementById('btnYonetim').innerText = 'Yönetimi Kapat';
        kullaniciListesiniCiz();
    } else {
        yonetimAcik = false;
        document.getElementById('yonetimPaneli').style.display = 'none';
        document.getElementById('btnYonetim').innerText = 'Yönetim';
    }
    tabloyuGuncelle();
}

function sifreGuncelle() {
    const yeni = document.getElementById('yeniAdminSifre').value.trim();
    if (!yeni) { alert("Yeni şifre boş olamaz."); return; }
    adminSifre = yeni;
    localStorage.setItem(HAFIZA_SIFRE, adminSifre);
    const yonetici = kullanicilar.find(k => k.id === "yonetici");
    if (yonetici) { yonetici.sifre = yeni; verileriKaydet(); }
    document.getElementById('yeniAdminSifre').value = '';
    alert("Yönetim şifresi güncellendi!");
}

function kullaniciKaydet() {
    const ad = document.getElementById('yeniKullaniciAdi').value.trim();
    const sifre = document.getElementById('yeniKullaniciSifre').value.trim();
    if (!ad || !sifre) { alert("Kullanıcı adı ve şifre zorunludur!"); return; }

    kullanicilar.push({
        id: "kul_" + Date.now(),
        ad,
        sifre,
        alis: document.getElementById('yetki_alis').checked,
        f1: document.getElementById('yetki_f1').checked,
        f2: document.getElementById('yetki_f2').checked,
        f3: document.getElementById('yetki_f3').checked,
        f4: document.getElementById('yetki_f4').checked
    });

    verileriKaydet();
    document.getElementById('yeniKullaniciAdi').value = '';
    document.getElementById('yeniKullaniciSifre').value = '';
    kullaniciListesiniCiz();
    alert("Kullanıcı eklendi.");
}

function kullaniciSil(id) {
    if (id === "yonetici") { alert("Ana yönetici silinemez."); return; }
    if (!confirm("Bu kullanıcı silinsin mi?")) return;
    kullanicilar = kullanicilar.filter(k => k.id !== id);
    verileriKaydet();
    kullaniciListesiniCiz();
}

function kullaniciListesiniCiz() {
    const liste = document.getElementById('kullaniciListesi');
    liste.innerHTML = kullanicilar.map(k => {
        const yetkiler = new Array();
        if (k.alis) yetkiler.push("Alış");
        if (k.f1) yetkiler.push("Satış 1");
        if (k.f2) yetkiler.push("Satış 2");
        if (k.f3) yetkiler.push("Satış 3");
        if (k.f4) yetkiler.push("Satış 4");
        return `<div class="user-item">
            <span><strong>${k.ad}</strong> (Şifre: ${k.sifre}) — <em>${yetkiler.join(', ') || 'Yetki Yok'}</em></span>
            ${k.id !== 'yonetici' ? `<button class="btn-sm-del" onclick="kullaniciSil('${k.id}')">Sil</button>` : ''}
        </div>`;
    }).join('');
}
function urunEkle() {
    const isim = document.getElementById('urunIsmi').value.trim();
    if (!isim) { alert("Ürün ismi zorunludur!"); return; }

    urunler.unshift({
        id: Date.now() + Math.random(),
        kod: document.getElementById('stokKodu').value.trim(),
        barkod: document.getElementById('barkod').value.trim(),
        isim: isim,
        aciklama: document.getElementById('urunAciklama').value.trim(),
        alis: parseFloat(document.getElementById('alisFiyat').value) || 0,
        f1: parseFloat(document.getElementById('satisFiyat1').value) || 0,
        f2: parseFloat(document.getElementById('satisFiyat2').value) || 0,
        f3: parseFloat(document.getElementById('satisFiyat3').value) || 0,
        f4: parseFloat(document.getElementById('satisFiyat4').value) || 0
    });

    verileriKaydet();
    ['stokKodu', 'barkod', 'urunIsmi', 'urunAciklama', 'alisFiyat', 'satisFiyat1', 'satisFiyat2', 'satisFiyat3', 'satisFiyat4'].forEach(id => {
        document.getElementById(id).value = '';
    });
    tabloyuGuncelle();
}

function urunSil(id) {
    if (!confirm("Bu ürün silinsin mi?")) return;
    urunler = urunler.filter(u => u.id !== id);
    verileriKaydet();
    tabloyuGuncelle();
}

function satirFiyatGuncelle(id, alan, inputEl) {
    const urun = urunler.find(u => u.id === id);
    if (!urun) return;
    const yeniDeger = parseFloat(inputEl.value.replace(',', '.')) || 0;
    if (urun[alan] !== yeniDeger) {
        urun[alan] = yeniDeger;
        verileriKaydet();
        inputEl.classList.add('inline-saved');
        setTimeout(() => inputEl.classList.remove('inline-saved'), 900);
    }
}

function fiyatFormat(sayi) {
    const n = Number(sayi) || 0;
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

function aramayiTemizle() {
    document.getElementById('aramaKutusu').value = '';
    tabloyuGuncelle();
}

function tabloyuGuncelle() {
    if (!aktifKullanici) return;
    const govde = document.getElementById('urunListesiGovde');
    const arama = document.getElementById('aramaKutusu').value.toLocaleLowerCase('tr-TR').trim();
    const kelimeler = arama.split(/\s+/).filter(Boolean);

    document.getElementById('th_alis').classList.toggle('hidden-col', !aktifKullanici.alis);
    document.getElementById('th_f1').classList.toggle('hidden-col', !aktifKullanici.f1);
    document.getElementById('th_f2').classList.toggle('hidden-col', !aktifKullanici.f2);
    document.getElementById('th_f3').classList.toggle('hidden-col', !aktifKullanici.f3);
    document.getElementById('th_f4').classList.toggle('hidden-col', !aktifKullanici.f4);
    document.getElementById('th_islem').classList.toggle('hidden-col', !yonetimAcik);

    const filtreli = urunler.filter(u => {
        if (kelimeler.length === 0) return true;
        const metin = `${u.kod || ''} ${u.barkod || ''} ${u.isim || ''} ${u.aciklama || ''}`.toLocaleLowerCase('tr-TR');
        return kelimeler.every(k => metin.includes(k));
    });

    document.getElementById('urunSayaci').innerText = filtreli.length;

    govde.innerHTML = filtreli.map(u => {
        const masaustuHucre = (alan, yetki, sinif) => {
            if (!yetki) return '';
            if (yonetimAcik) {
                const inputSinif = alan === 'alis' ? 'inline-price-input buy-input' : 'inline-price-input';
                return `<td class="text-right desktop-col">
                    <input type="number" step="0.01" inputmode="decimal" class="${inputSinif}" 
                        value="${u[alan] || 0}" 
                        onchange="satirFiyatGuncelle(${u.id}, '${alan}', this)"
                        onkeydown="if(event.key==='Enter') this.blur()">
                </td>`;
            }
            return `<td class="text-right desktop-col ${sinif}">${fiyatFormat(u[alan])}</td>`;
        };

        const mobilFiyatOgesi = (alan, yetki, isAlis) => {
            if (!yetki) return '';
            if (yonetimAcik) {
                const inputSinif = isAlis ? 'inline-price-input buy-input' : 'inline-price-input';
                return `<input type="number" step="0.01" inputmode="decimal" class="${inputSinif}" 
                    value="${u[alan] || 0}" 
                    onchange="satirFiyatGuncelle(${u.id}, '${alan}', this)"
                    onkeydown="if(event.key==='Enter') this.blur()">`;
            }
            const badgeSinif = isAlis ? 'm-badge m-badge-buy' : 'm-badge';
            return `<span class="${badgeSinif}">${fiyatFormat(u[alan])}</span>`;
        };

        return `<tr>
            <td class="desktop-col">${u.kod ? `<span class="code-tag">${u.kod}</span>` : '-'}</td>
            <td class="desktop-col">${u.barkod || '-'}</td>
            <td class="product-name-cell">
                <span>${u.isim}</span>
                ${yonetimAcik ? `<button class="btn-sm-del mobile-del-btn" onclick="urunSil(${u.id})">Sil</button>` : ''}
            </td>
            <td class="desktop-col">${u.aciklama || '-'}</td>
            ${masaustuHucre('alis', aktifKullanici.alis, 'price-buy')}
            ${masaustuHucre('f1', aktifKullanici.f1, 'price-sell')}
            ${masaustuHucre('f2', aktifKullanici.f2, 'price-sell')}
            ${masaustuHucre('f3', aktifKullanici.f3, 'price-sell')}
            ${masaustuHucre('f4', aktifKullanici.f4, 'price-sell')}
            ${yonetimAcik ? `<td class="text-right desktop-col col-action"><button class="btn-sm-del" onclick="urunSil(${u.id})">Sil</button></td>` : ''}
            <td class="mobile-price-row">
                ${mobilFiyatOgesi('alis', aktifKullanici.alis, true)}
                ${mobilFiyatOgesi('f1', aktifKullanici.f1, false)}
                ${mobilFiyatOgesi('f2', aktifKullanici.f2, false)}
                ${mobilFiyatOgesi('f3', aktifKullanici.f3, false)}
                ${mobilFiyatOgesi('f4', aktifKullanici.f4, false)}
            </td>
        </tr>`;
    }).join('');
}

function listeyiTemizle() {
    if (!confirm("TÜM ürünler kalıcı olarak silinecek. Emin misiniz?")) return;
    urunler = new Array();
    verileriKaydet();
    tabloyuGuncelle();
}

function sablonIndir() {
    const csv = "\uFEFFStok Kodu;Barkod;Ürün İsmi;Açıklama;Alış Fiyat;Satış 1;Satış 2;Satış 3;Satış 4\nSTK-01;869000000001;Örnek Ürün;Açıklama;100.00;150.00;140.00;130.00;120.00";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fiyat_listesi_sablon.csv";
    a.click();
}

function excelAktar() {
    let csv = "\uFEFFStok Kodu;Barkod;Ürün İsmi;Açıklama;Alış Fiyat;Satış 1;Satış 2;Satış 3;Satış 4\n";
    urunler.forEach(u => {
        csv += `${u.kod};${u.barkod};${u.isim};${u.aciklama};${u.alis};${u.f1};${u.f2};${u.f3};${u.f4}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Ertu_Fiyat_Listesi_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
}

function exceldenYukle(event) {
    const dosya = event.target.files.item(0);
    if (!dosya) return;
    const okuyucu = new FileReader();
    okuyucu.onload = function(e) {
        const satirlar = e.target.result.split(/\r?\n/);
        let eklenen = 0;
        for (let i = 1; i < satirlar.length; i++) {
            const s = satirlar.at(i).trim();
            if (!s) continue;
            const ayrac = s.includes(';') ? ';' : ',';
            const c = s.split(ayrac);
            if (c.length >= 3 && (c.at(2) || '').trim()) {
                urunler.push({
                    id: Date.now() + Math.random(),
                    kod: (c.at(0) || '').trim(),
                    barkod: (c.at(1) || '').trim(),
                    isim: (c.at(2) || '').trim(),
                    aciklama: (c.at(3) || '').trim(),
                    alis: parseFloat((c.at(4) || '0').replace(',', '.')) || 0,
                    f1: parseFloat((c.at(5) || '0').replace(',', '.')) || 0,
                    f2: parseFloat((c.at(6) || '0').replace(',', '.')) || 0,
                    f3: parseFloat((c.at(7) || '0').replace(',', '.')) || 0,
                    f4: parseFloat((c.at(8) || '0').replace(',', '.')) || 0
                });
                eklenen++;
            }
        }
        verileriKaydet();
        tabloyuGuncelle();
        alert(`${eklenen} ürün başarıyla yüklendi!`);
        event.target.value = "";
    };
    okuyucu.readAsText(dosya, "UTF-8");
}

function verileriYedekle() {
    const veri = JSON.stringify({ urunler, kullanicilar, adminSifre }, null, 2);
    const blob = new Blob([veri], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Ertu_Yedek_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function verileriGeriYukle(event) {
    const dosya = event.target.files.item(0);
    if (!dosya) return;
    const okuyucu = new FileReader();
    okuyucu.onload = function(e) {
        try {
            const d = JSON.parse(e.target.result);
            if (d.urunler) urunler = d.urunler;
            if (d.kullanicilar) kullanicilar = d.kullanicilar;
            if (d.adminSifre) adminSifre = d.adminSifre;
            verileriKaydet();
            localStorage.setItem(HAFIZA_SIFRE, adminSifre);
            girisListesiniDoldur();
            tabloyuGuncelle();
            alert("Veriler başarıyla yüklendi!");
        } catch (err) { alert("Dosya okunamadı."); }
        event.target.value = "";
    };
    okuyucu.readAsText(dosya);
}
function sesliAramaBaslat() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Tarayıcınız sesli aramayı desteklemiyor (Chrome veya Safari kullanın).");
        return;
    }

    const btn = document.getElementById('btnSesliArama');
    const aramaInput = document.getElementById('aramaKutusu');
    const tanima = new SpeechRecognition();
    tanima.lang = 'tr-TR';
    tanima.interimResults = false;
    tanima.maxAlternatives = 1;

    tanima.onstart = function() {
        btn.classList.add('dinliyor');
        aramaInput.placeholder = "Dinleniyor... Ürün adını söyleyin";
    };

    tanima.onresult = function(event) {
        let sonuc = event.results.item(0).item(0).transcript;
        sonuc = sonuc.replace(/[.,!?]+$/g, '').trim();
        aramaInput.value = sonuc;
        tabloyuGuncelle();
    };

    tanima.onerror = function(event) {
        if (event.error === 'not-allowed') {
            alert("Mikrofon izni verilmedi. Tarayıcı ayarlarından mikrofona izin verin.");
        }
    };

    tanima.onend = function() {
        btn.classList.remove('dinliyor');
        aramaInput.placeholder = "Ürün ismi, kod, barkod veya mikrofona konuşun...";
    };

    tanima.start();
}

async function veriliHtmlIndir() {
    try {
        const cssMetin = await fetch('style.css').then(r => r.text());
        const jsMetin = await fetch('script.js').then(r => r.text());
        const klon = document.documentElement.cloneNode(true);

        klon.querySelector('#girisEkrani').style.display = 'flex';
        klon.querySelector('#anaEkran').style.display = 'none';
        klon.querySelector('#yonetimPaneli').style.display = 'none';
        klon.querySelector('#btnYonetim').innerText = 'Yönetim';
        klon.querySelector('#urunListesiGovde').innerHTML = '';

        const cssLink = klon.querySelector('link[href="style.css"]');
        if (cssLink) {
            const styleEl = document.createElement('style');
            styleEl.textContent = cssMetin;
            cssLink.replaceWith(styleEl);
        }

        const gomuluVeri = JSON.stringify({ urunler, kullanicilar, adminSifre });
        const hazirJs = `
            (function(){
                const p = ${gomuluVeri};
                localStorage.setItem("ertu_fiyat_urunler_v4", JSON.stringify(p.urunler));
                localStorage.setItem("ertu_fiyat_kullanicilar_v4", JSON.stringify(p.kullanicilar));
                localStorage.setItem("ertu_fiyat_admin_sifre_v4", p.adminSifre);
            })();\n` + jsMetin;

        const jsScript = klon.querySelector('script[src="script.js"]');
        if (jsScript) {
            const scriptEl = document.createElement('script');
            scriptEl.textContent = hazirJs;
            jsScript.replaceWith(scriptEl);
        }

        const blob = new Blob(["<!DOCTYPE html>\n" + klon.outerHTML], { type: "text/html;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Ertu_Fiyat_Listesi_Mobil_${new Date().toISOString().slice(0,10)}.html`;
        link.click();
    } catch (e) {
        alert("Tek dosya oluşturmak için sayfayı yerel sunucu (Live Server / Python http.server) üzerinden açmalısınız.");
    }
}


girisListesiniDoldur();
