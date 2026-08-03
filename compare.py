import os
import re
from pypdf import PdfReader


def extract_text_from_pdf(pdf_path):
    """Kay-stakhrej l-kettaba kamla men l-PDF."""
    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
        return full_text
    except Exception as e:
        print(f"❌ Moshkil f qrayet l-fichier {pdf_path}: {e}")
        return ""


def natural_sort_key(s):
    """Kay-rttab les références t-taza'odi (Croissant) b shakl sa7i7 (ex: KM-2 kat-ji qbel KM-10)."""
    return [
        int(text) if text.isdigit() else text.lower()
        for text in re.split(r"(\d+)", s)
    ]


def parse_articles_from_text(text, line_pattern):
    """Kay-stakhrej les articles: dict { 'REFERENCE': 'NOM_COMMERCIAL' }"""
    articles = {}
    lines = text.split("\n")

    for line in lines:
        line_clean = line.strip()
        match = re.search(line_pattern, line_clean, re.IGNORECASE)
        if match:
            ref = match.group("ref").strip().upper()
            nom = match.group("nom").strip()
            articles[ref] = nom

    return articles


def compare_and_print_table(file1, file2, line_pattern):
    if not os.path.exists(file1) or not os.path.exists(file2):
        print(
            "❌ ERROR: Wahed men les fichiers (wla bjouj) ma-kayninhsh f l-path!"
        )
        return

    # 1. Extraction dyal l-text
    text1 = extract_text_from_pdf(file1)
    text2 = extract_text_from_pdf(file2)

    articles_pdf1 = parse_articles_from_text(text1, line_pattern)
    articles_pdf2 = parse_articles_from_text(text2, line_pattern)

    # 2. Jam3 les références kamlin
    all_refs = list(set(articles_pdf1.keys()).union(set(articles_pdf2.keys())))

    # 3. 📌 TRI CROISSANT (T-Tartib t-Taza'odi par Référence)
    all_refs = sorted(all_refs, key=natural_sort_key)

    if not all_refs:
        print(
            "⚠️ MA-LKINA HTA ARTICLE! Qad `line_pattern` bash y-matshea m3a l-PDF dyalek."
        )
        return

    print("\n" + "=" * 90)
    print("📊 TABLEAU COMPARATIF DIAL LES ARTICLES (PDF 1 VS PDF 2)")
    print("=" * 90)

    # En-tête dial le Tableau
    header = f"{'REF':<10} | {'ARTICLE PDF 1':<30} | {'NEFSO?':<12} | {'ARTICLE PDF 2':<30}"
    print(header)
    print("-" * 90)

    matches_count = 0
    errors_count = 0

    for ref in all_refs:
        nom1 = articles_pdf1.get(ref)
        nom2 = articles_pdf2.get(ref)

        # 1. Article kayn f PDF 1 w kayn f PDF 2
        if nom1 and nom2:
            if nom1.lower() == nom2.lower():
                same = "✅ Oui"
                matches_count += 1
            else:
                same = "⚠️ Différent"
                errors_count += 1

            p1_str = f"{ref} - {nom1}"
            p2_str = f"{ref} - {nom2}"
            print(
                f"{ref:<10} | {p1_str[:30]:<30} | {same:<12} | {p2_str[:30]:<30}"
            )

        # 2. Article kayn f PDF 1 w MA-KAYNSH f PDF 2
        elif nom1 and not nom2:
            same = "❌ La (PDF 2)"
            errors_count += 1
            p1_str = f"{ref} - {nom1}"
            print(f"{ref:<10} | {p1_str[:30]:<30} | {same:<12} | {'---':<30}")

        # 3. Article kayn f PDF 2 w MA-KAYNSH f PDF 1
        elif not nom1 and nom2:
            same = "❌ La (PDF 1)"
            errors_count += 1
            p2_str = f"{ref} - {nom2}"
            print(f"{ref:<10} | {'---':<30} | {same:<12} | {p2_str[:30]:<30}")

    # --- SUMMARY ---
    print("=" * 90)
    print(
        f"📈 Bilan: {matches_count} articles Kifkif ✅  |  {errors_count} Iwkhtilafat ❌"
    )

    if errors_count == 0:
        print(
            "🎉 VERDICT: Les deux PDF contiennent EXACTEMENT les mêmes articles !"
        )
    else:
        print("⚠️ VERDICT: Kaynin articles manquants awla différents mabin les PDF.")
    print("=" * 90 + "\n")


# ==========================================
# --- CONFIGURATION ---
# ==========================================
if __name__ == "__main__":

    pdf_1 = "./assets/Packing list 0218.pdf"
    pdf_2 = "./assets/Proforma Invoice KMINA 0218.pdf"

    # Regex d'extraction (Référence + Nom Commercial)
    line_pattern = (
        r"(?P<ref>\b[A-Z0-9\.-]{2,12}\b)\s+(?P<nom>[A-Za-z0-9\s\.-]{3,40})"
    )

    compare_and_print_table(pdf_1, pdf_2, line_pattern)