"""
PharmaQo - Gerador de Rotulos em Lote
Sobrepoe QR codes na imagem base da etiqueta e gera um PDF unico.

Uso:
  1. Coloque a imagem base (base.png) nesta pasta scripts/
  2. Coloque os QR codes (.png/.jpg) na pasta qrcodes_entrada/
  3. Execute: python gerar_rotulos.py
  4. O PDF sera salvo em rotulos_finalizados/todos_os_rotulos.pdf

Tambem pode gerar QR codes automaticamente a partir de codigos de autenticidade:
  python gerar_rotulos.py --gerar-qr --codigos "PHQ-TREN100-FGT0KEYA,PHQ-TREN100-ICQ3Y65G"
  python gerar_rotulos.py --gerar-qr --arquivo codigos.csv
  python gerar_rotulos.py --gerar-qr --quantidade 50 --produto "TREN100"
"""

from PIL import Image
from pathlib import Path
import argparse
import string
import random

# ================= CONFIGURACOES =================
BASE_DIR = Path(__file__).resolve().parent
CAMINHO_BASE = BASE_DIR / "base.png"
PASTA_QRCODES = BASE_DIR / "qrcodes_entrada"
PASTA_SAIDA = BASE_DIR / "rotulos_finalizados"
NOME_ARQUIVO_FINAL = "todos_os_rotulos.pdf"

# Posicao (X, Y) onde o canto superior esquerdo do QR code deve ficar
POSICAO_X = 880
POSICAO_Y = 230

# Tamanho desejado para o QR Code (Largura, Altura) em pixels
TAMANHO_QRCODE = (158, 158)
# =================================================


def gerar_codigo_autenticidade(produto: str = "PROD") -> str:
    """Gera um codigo de autenticidade no formato PHQ-{PRODUTO}-{8CHARS}"""
    chars = string.ascii_uppercase + string.digits
    abbrev = "".join(c for c in produto.upper() if c.isalnum())[:7]
    suffix = "".join(random.choices(chars, k=8))
    return f"PHQ-{abbrev}-{suffix}"


def gerar_qrcodes(codigos: list[str], base_url: str = "http://localhost:3000") -> None:
    """Gera imagens de QR code para cada codigo de autenticidade"""
    try:
        import qrcode
    except ImportError:
        print("Instalando qrcode...")
        import subprocess
        subprocess.check_call(["pip", "install", "qrcode[pil]"])
        import qrcode

    PASTA_QRCODES.mkdir(exist_ok=True)

    for i, codigo in enumerate(codigos):
        url = f"{base_url}/verify?code={codigo}"
        qr = qrcode.QRCode(version=1, box_size=10, border=1)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#1a3a7c", back_color="white")
        nome_arquivo = PASTA_QRCODES / f"qr_{i+1:04d}_{codigo}.png"
        img.save(nome_arquivo)
        print(f"[QR] Gerado: {nome_arquivo.name}")

    print(f"\n{len(codigos)} QR codes gerados em: {PASTA_QRCODES}")


def processar_lote_pdf_unico():
    """Processa todos os QR codes e gera um PDF unico com todas as etiquetas"""
    PASTA_SAIDA.mkdir(exist_ok=True)

    try:
        imagem_base = Image.open(CAMINHO_BASE).convert("RGBA")
    except FileNotFoundError:
        print(f"Erro: A imagem base '{CAMINHO_BASE}' nao foi encontrada.")
        print(f"Copie a imagem da etiqueta base para: {CAMINHO_BASE}")
        return

    if not PASTA_QRCODES.exists():
        print(f"Erro: A pasta de QR codes '{PASTA_QRCODES}' nao foi encontrada.")
        return

    arquivos = [
        arquivo
        for arquivo in sorted(PASTA_QRCODES.iterdir())
        if arquivo.suffix.lower() in (".png", ".jpg", ".jpeg")
    ]

    if not arquivos:
        print("Nenhum QR code encontrado na pasta de entrada.")
        print(f"Coloque as imagens dos QR codes em: {PASTA_QRCODES}")
        return

    print(f"Iniciando a geracao de um PDF unico com {len(arquivos)} paginas...")

    lista_imagens_pdf = []

    for caminho_qr in arquivos:
        try:
            qr_img = Image.open(caminho_qr).convert("RGBA")
            qr_img = qr_img.resize(TAMANHO_QRCODE)

            imagem_final = imagem_base.copy()
            imagem_final.paste(qr_img, (POSICAO_X, POSICAO_Y), qr_img)
            imagem_final = imagem_final.convert("RGB")

            lista_imagens_pdf.append(imagem_final)
            print(f"[OK] Pagina processada para o arquivo: {caminho_qr.name}")

        except Exception as e:
            print(f"[ERRO] Erro ao processar o arquivo {caminho_qr.name}: {e}")

    if lista_imagens_pdf:
        caminho_salvar = PASTA_SAIDA / NOME_ARQUIVO_FINAL

        primeira_pagina = lista_imagens_pdf[0]
        demais_paginas = lista_imagens_pdf[1:]

        primeira_pagina.save(
            caminho_salvar,
            "PDF",
            resolution=300.0,
            save_all=True,
            append_images=demais_paginas,
        )
        print(f"\nPDF unico criado com sucesso: {caminho_salvar}")
        print(f"Total de paginas: {len(lista_imagens_pdf)}")


def main():
    parser = argparse.ArgumentParser(description="PharmaQo - Gerador de Rotulos em Lote")
    parser.add_argument("--gerar-qr", action="store_true", help="Gerar QR codes antes de processar")
    parser.add_argument("--codigos", type=str, help="Lista de codigos separados por virgula")
    parser.add_argument("--arquivo", type=str, help="Arquivo CSV com codigos (um por linha)")
    parser.add_argument("--quantidade", type=int, default=10, help="Quantidade de codigos a gerar")
    parser.add_argument("--produto", type=str, default="PROD", help="Nome/abreviacao do produto")
    parser.add_argument("--url", type=str, default="http://localhost:3000", help="URL base para verificacao")
    args = parser.parse_args()

    if args.gerar_qr:
        codigos = []
        if args.codigos:
            codigos = [c.strip() for c in args.codigos.split(",")]
        elif args.arquivo:
            with open(args.arquivo) as f:
                codigos = [line.strip() for line in f if line.strip() and not line.startswith("Codigo")]
        else:
            codigos = [gerar_codigo_autenticidade(args.produto) for _ in range(args.quantidade)]
            print(f"Codigos gerados para {args.produto}:")
            for c in codigos:
                print(f"  {c}")

        gerar_qrcodes(codigos, args.url)
        print()

    processar_lote_pdf_unico()


if __name__ == "__main__":
    main()
