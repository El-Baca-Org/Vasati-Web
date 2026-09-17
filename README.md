# Vasati Web

Vasati'nin klasik Türk zaman hesaplama mantığının web karşılığıdır.

## Özellikler

- İstanbul için modern zamanı gösterir.
- `Vakitler.xml` verisini tarayıcıda parse eder.
- Vasatî yıl hesabını korur.
- Akşamı başlangıç kabul eden Vasatî vakit dönüşümünü uygular.
- Vakitleri duyarlı modern bir arayüzde gösterir.
- Docker ile nginx üzerinde çalışır.

## Geliştirme

```bash
npm install
npm run dev
```

## Doğrulama

```bash
npm run typecheck
npm run build
```

## Dağıtım

`master` push'u GitHub Actions üzerinden container'ı GHCR'a gönderir ve
Rancher/K3s üzerindeki `vasati-web` namespace'ine deploy eder.
