export interface BlogArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  categorySlug: string;
  tags: string[];
  readTime: string;
  views: number;
  featured: boolean;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
}

export const articles: BlogArticle[] = [
  {
    title: 'Panduan Lengkap Membangun RAG Pipeline dengan Python dan LangChain',
    slug: 'panduan-lengkap-rag-pipeline-python-langchain',
    excerpt: 'Pelajari cara membangun Retrieval-Augmented Generation pipeline dari nol menggunakan Python, LangChain, dan Pinecone. Artikel ini mencakup arsitektur, chunking strategy, embedding, hingga deployment.',
    content: `Retrieval-Augmented Generation atau RAG telah menjadi pendekatan dominan dalam membangun aplikasi AI yang membutuhkan pengetahuan spesifik. Alih-alih mengandalkan pengetahuan bawaan LLM yang bisa outdated, RAG mengambil informasi relevan dari knowledge base saat runtime.

## Apa Itu RAG dan Mengapa Penting?

RAG menggabungkan dua komponen utama: **retriever** yang mencari dokumen relevan dari knowledge base, dan **generator** (LLM) yang membuat jawaban berdasarkan dokumen tersebut. Pendekatan ini mengatasi tiga masalah utama LLM: hallucination, pengetahuan yang outdated, dan ketidakmampuan mengakses data proprietary.

Dalam konteks bisnis, RAG memungkinkan kita membangun chatbot yang menjawab berdasarkan dokumentasi internal, policy perusahaan, atau database produk — tanpa perlu fine-tuning model yang mahal.

## Arsitektur RAG Pipeline

Pipeline RAG terdiri dari dua fase utama:

**Fase Ingestion (Offline):**
- Memuat dokumen dari berbagai sumber (PDF, website, database)
- Memecah dokumen menjadi chunks yang optimal
- Mengubah setiap chunk menjadi vector embedding
- Menyimpan embedding ke vector database

**Fase Query (Online):**
- Menerima pertanyaan user
- Mengubah pertanyaan menjadi embedding
- Mencari chunks paling relevan di vector database
- Mengirim konteks + pertanyaan ke LLM untuk generate jawaban

## Chunking Strategy yang Optimal

Ukuran chunk sangat mempengaruhi kualitas retrieval. Chunk terlalu besar mengandung noise, terlalu kecil kehilangan konteks. Berdasarkan eksperimen di beberapa proyek, berikut panduan praktis:

- **Dokumentasi teknis:** 500-800 token dengan overlap 100 token
- **Artikel blog/berita:** 300-500 token dengan overlap 50 token
- **Legal documents:** 800-1200 token untuk menjaga konteks klausa

\`\`\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=600,
    chunk_overlap=100,
    separators=["\\n\\n", "\\n", ". ", " "]
)

chunks = splitter.split_documents(documents)
\`\`\`

> **Tips:** Gunakan RecursiveCharacterTextSplitter dari LangChain karena ia memecah di natural boundaries (paragraf, kalimat) sebelum memotong di tengah teks.

## Memilih Embedding Model

Pilihan embedding model menentukan kualitas semantic search. Beberapa opsi populer:

- **OpenAI text-embedding-3-small:** Akurasi tinggi, biaya per-token rendah, cocok untuk sebagian besar use case
- **Cohere embed-v3:** Performansi kompetitif, support multilingual yang baik
- **Sentence Transformers (open-source):** Gratis, bisa di-host sendiri, privasi terjaga

Untuk proyek berbahasa Indonesia, embedding model multilingual seperti Cohere atau model dari Hugging Face yang di-train pada data Bahasa Indonesia memberikan hasil lebih baik dibanding model English-only.

## Vector Database: Pinecone vs Alternatif

Pinecone menawarkan managed vector database yang mudah digunakan dengan fitur filtering metadata. Alternatif lain:

- **Weaviate:** Open-source, hybrid search (vector + keyword)
- **Qdrant:** Performa tinggi, filtering yang powerful
- **ChromaDB:** Ringan, cocok untuk prototyping

\`\`\`python
import pinecone
from langchain.vectorstores import Pinecone

pinecone.init(api_key="YOUR_KEY", environment="gcp-starter")

vectorstore = Pinecone.from_documents(
    documents=chunks,
    embedding=embeddings,
    index_name="knowledge-base"
)
\`\`\`

## Retrieval yang Akurat

Retrieval sederhana menggunakan cosine similarity sering kali belum optimal. Teknik peningkatan:

- **Hybrid Search:** Kombinasi semantic search + BM25 keyword search
- **Re-ranking:** Gunakan cross-encoder untuk re-rank hasil retrieval
- **Multi-query retrieval:** Generate beberapa variasi pertanyaan untuk meningkatkan recall
- **Contextual compression:** Kompres dokumen yang di-retrieve agar hanya bagian relevan yang dikirim ke LLM

## Evaluasi Kualitas RAG

Metrik evaluasi yang penting:

- **Retrieval Precision:** Apakah dokumen yang diambil benar-benar relevan?
- **Answer Faithfulness:** Apakah jawaban sesuai dengan konteks yang diberikan?
- **Answer Relevancy:** Apakah jawaban menjawab pertanyaan user?

Framework seperti **RAGAS** membantu mengautomasi evaluasi ini dengan scoring otomatis menggunakan LLM.

## Deployment dan Scaling

Untuk production, pertimbangkan:

- **Caching:** Cache hasil retrieval untuk query yang sering diulang
- **Streaming response:** Gunakan streaming agar user tidak menunggu seluruh jawaban
- **Rate limiting:** Batasi request per user untuk mengontrol biaya API
- **Monitoring:** Track latency, retrieval quality, dan user satisfaction

RAG pipeline yang well-designed mampu menangani jutaan dokumen dengan response time di bawah 3 detik, memberikan pengalaman yang hampir real-time bagi pengguna akhir.`,
    coverUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
    categorySlug: 'ai-engineering',
    tags: ['RAG', 'LangChain', 'Python', 'AI', 'LLM', 'Vector Database'],
    readTime: '12 min',
    views: 6240,
    featured: true,
    publishedAt: '2025-02-10',
    metaTitle: 'Panduan Lengkap RAG Pipeline dengan Python & LangChain',
    metaDescription: 'Cara membangun RAG pipeline dari nol: arsitektur, chunking, embedding, vector database, retrieval optimization, dan deployment.',
  },
  {
    title: 'Fine-Tuning LLM untuk Kebutuhan Bisnis Spesifik',
    slug: 'fine-tuning-llm-kebutuhan-bisnis-spesifik',
    excerpt: 'Strategi fine-tuning Large Language Model untuk domain bisnis tertentu. Mulai dari persiapan dataset, pemilihan base model, teknik LoRA, hingga evaluasi hasil.',
    content: `Fine-tuning LLM menjadi semakin accessible berkat teknik parameter-efficient seperti LoRA dan QLoRA. Artikel ini membahas kapan fine-tuning tepat digunakan, bagaimana mempersiapkan dataset berkualitas, dan langkah-langkah praktis untuk menghasilkan model yang sesuai kebutuhan bisnis.

## Kapan Fine-Tuning Dibutuhkan?

Tidak semua kasus membutuhkan fine-tuning. Pertimbangkan fine-tuning ketika:

- **RAG tidak cukup** — model perlu memahami pola bahasa atau format output tertentu
- **Konsistensi output kritis** — model harus selalu mengikuti template atau gaya tertentu
- **Domain knowledge yang sangat spesifik** — terminologi medis, hukum, atau teknis
- **Biaya API terlalu tinggi** — fine-tuned model kecil bisa menggantikan model besar untuk task spesifik

> Sebelum fine-tuning, selalu coba dulu: prompt engineering yang baik, few-shot examples, dan RAG. Jika ketiganya tidak memadai, barulah fine-tuning menjadi opsi yang masuk akal.

## Persiapan Dataset

Kualitas dataset menentukan 80% keberhasilan fine-tuning. Berikut standar yang harus dipenuhi:

**Volume data:**
- Minimum 500-1000 contoh training yang berkualitas
- Ideal 3000-5000 contoh untuk hasil yang robust
- Validation set minimal 10-15% dari total data

**Format data:**
Gunakan format instruction-following yang standar:

\`\`\`json
{
  "messages": [
    {"role": "system", "content": "Kamu adalah customer service expert."},
    {"role": "user", "content": "Bagaimana cara mengembalikan barang?"},
    {"role": "assistant", "content": "Untuk pengembalian barang..."}
  ]
}
\`\`\`

**Quality checklist:**
- Setiap contoh harus akurat dan factually correct
- Variasi yang cukup dalam pola pertanyaan
- Tidak ada data duplikat
- Label yang konsisten

## Memilih Base Model

Pilihan base model bergantung pada kebutuhan:

- **Llama 3.1 8B:** Balance antara performa dan resource, cocok untuk deployment on-premise
- **Mistral 7B:** Performa tinggi untuk ukurannya, excellent untuk text generation
- **GPT-4o mini (via OpenAI API):** Fine-tuning tanpa perlu infrastructure, cocok untuk startup
- **Gemma 2 9B:** Performa kompetitif dari Google, lisensi ramah komersial

## Teknik LoRA dan QLoRA

LoRA (Low-Rank Adaptation) memungkinkan fine-tuning dengan melatih hanya sebagian kecil parameter, mengurangi kebutuhan GPU secara drastis.

\`\`\`python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    task_type="CAUSAL_LM"
)

model = get_peft_model(base_model, lora_config)
\`\`\`

**QLoRA** menambahkan kuantisasi 4-bit pada base model, memungkinkan fine-tuning model 7B pada GPU dengan VRAM 16GB — bahkan bisa menggunakan Google Colab.

## Training Process

Hyperparameter yang perlu diperhatikan:

- **Learning rate:** 1e-4 hingga 2e-5 (mulai dari yang kecil)
- **Epochs:** 2-5 epoch biasanya cukup, lebih dari itu risiko overfitting
- **Batch size:** Sesuaikan dengan VRAM yang tersedia
- **Warmup steps:** 5-10% dari total training steps

Monitor training loss dan validation loss. Jika validation loss mulai naik sementara training loss turun, itu tanda overfitting — hentikan training.

## Evaluasi Model

Evaluasi harus dilakukan secara kuantitatif dan kualitatif:

**Metrik otomatis:**
- Perplexity untuk language modeling
- BLEU/ROUGE untuk text generation
- Accuracy untuk classification tasks
- F1 Score untuk balanced evaluation

**Human evaluation:**
- Blind comparison antara base model dan fine-tuned model
- Rating oleh domain expert
- A/B testing dengan real users

## Deployment

Setelah model siap, pertimbangkan:

- **vLLM** untuk serving yang efisien dengan continuous batching
- **Kuantisasi GGUF** untuk deployment di hardware terbatas
- **NVIDIA TensorRT-LLM** untuk performa maksimal di GPU NVIDIA
- API wrapper dengan FastAPI untuk integrasi yang mudah

Pada proyek customer service automation, fine-tuning model Llama 3.1 8B dengan 3000 contoh percakapan menghasilkan peningkatan akurasi jawaban dari 71% menjadi 93%, dengan latency inference rata-rata 800ms per response.`,
    coverUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=630&fit=crop',
    categorySlug: 'ai-engineering',
    tags: ['LLM', 'Fine-Tuning', 'LoRA', 'Machine Learning', 'Deep Learning'],
    readTime: '14 min',
    views: 5120,
    featured: true,
    publishedAt: '2025-01-18',
    metaTitle: 'Fine-Tuning LLM untuk Bisnis — LoRA, QLoRA, dan Best Practices',
    metaDescription: 'Panduan fine-tuning LLM: persiapan dataset, teknik LoRA/QLoRA, training process, evaluasi, dan deployment untuk kebutuhan bisnis.',
  },
  {
    title: 'Computer Vision untuk Quality Control di Industri Manufaktur',
    slug: 'computer-vision-quality-control-manufaktur',
    excerpt: 'Studi kasus implementasi computer vision menggunakan YOLOv8 untuk sistem inspeksi visual otomatis pada lini produksi manufaktur. Dari pengumpulan data hingga deployment edge.',
    content: `Inspeksi visual manual pada lini produksi manufaktur memiliki keterbatasan fundamental: kelelahan mata operator, inkonsistensi antar shift, dan throughput yang terbatas. Computer vision menawarkan alternatif yang lebih akurat, konsisten, dan scalable. Artikel ini membagikan pengalaman implementasi sistem inspeksi visual otomatis di lini produksi PCB menggunakan YOLOv8.

## Tantangan Inspeksi Manual

Sebelum memasang sistem computer vision, pabrik mengandalkan 12 operator QC yang bekerja dalam 3 shift. Masalah yang dihadapi:

- **Tingkat deteksi hanya 94%** — 6% produk cacat lolos ke konsumen
- **False rejection 8%** — produk bagus dibuang, menyebabkan waste
- **Kelelahan operator** — akurasi menurun 15% setelah jam ke-4
- **Bottleneck produksi** — kecepatan inspeksi manual terbatas 40 unit/menit

## Arsitektur Sistem

Sistem yang dibangun terdiri dari beberapa komponen utama:

**Hardware:**
- Kamera industrial 5MP dengan global shutter
- LED ring light untuk pencahayaan konsisten
- NVIDIA Jetson Orin untuk inference di edge
- Conveyor belt encoder untuk sinkronisasi trigger kamera

**Software:**
- YOLOv8 sebagai detection model
- Python + OpenCV untuk image preprocessing
- FastAPI sebagai inference server
- PostgreSQL untuk logging hasil inspeksi

## Pengumpulan dan Anotasi Data

Kualitas model sangat bergantung pada data training yang representatif. Langkah-langkah yang dilakukan:

- Mengumpulkan 15.000 gambar dari lini produksi selama 2 minggu
- Mencakup berbagai kondisi: pencahayaan berbeda, variasi produk, dan jenis cacat
- Anotasi menggunakan Roboflow dengan format YOLO
- Augmentasi data: rotasi, flipping, brightness variation, dan noise injection

> **Pelajaran penting:** Gambar dari lini produksi real jauh berbeda dari foto studio. Pastikan training data mencerminkan kondisi aktual — termasuk debu, refleksi, dan variasi posisi produk.

## Training Model YOLOv8

Proses training dilakukan menggunakan Ultralytics framework:

\`\`\`python
from ultralytics import YOLO

model = YOLO('yolov8m.pt')

results = model.train(
    data='dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    patience=15,
    augment=True
)
\`\`\`

**Kelas deteksi yang didefinisikan:**
- Solder bridge (hubung-singkat)
- Missing component (komponen hilang)
- Misalignment (posisi miring)
- Scratch (goresan)
- Contamination (kontaminasi)

Setelah 100 epoch training, model mencapai mAP50 sebesar 96.8% pada validation set.

## Optimasi untuk Edge Deployment

Model harus berjalan di Jetson Orin dengan latency rendah. Strategi optimasi:

- **Export ke TensorRT** untuk inference 3x lebih cepat
- **Kuantisasi INT8** mengurangi model size 75% dengan kehilangan akurasi minimal
- **Input resolution tuning** — 640px cukup untuk deteksi cacat PCB
- **Batch inference** untuk memproses multiple images sekaligus

Hasil: inference time turun dari 45ms menjadi 12ms per gambar, memungkinkan throughput 80+ unit/menit.

## Integrasi dengan Lini Produksi

Sistem dihubungkan dengan PLC (Programmable Logic Controller) pabrik:

- Kamera di-trigger oleh sensor proximity saat produk melewati titik inspeksi
- Hasil deteksi dikirim ke PLC dalam 50ms
- Produk cacat otomatis dialihkan ke jalur reject
- Dashboard real-time menampilkan statistik produksi dan jenis cacat

## Hasil Implementasi

Setelah 3 bulan operasional:

- **Detection rate naik dari 94% ke 99.4%**
- **False rejection turun dari 8% ke 1.2%**
- **Throughput meningkat 100%** — dari 40 menjadi 80 unit/menit
- **ROI tercapai dalam 8 bulan** — penghematan dari pengurangan produk retur dan waste
- Operator QC dialihkan ke tugas yang lebih bernilai tinggi

Sistem ini membuktikan bahwa computer vision bukan hanya teknologi futuristik, tetapi solusi praktis yang memberikan ROI nyata di industri manufaktur.`,
    coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=630&fit=crop',
    categorySlug: 'ai-engineering',
    tags: ['Computer Vision', 'YOLOv8', 'Manufacturing', 'Edge AI', 'Deep Learning'],
    readTime: '13 min',
    views: 4890,
    featured: false,
    publishedAt: '2024-12-15',
    metaTitle: 'Computer Vision QC Manufaktur — YOLOv8 & Edge Deployment',
    metaDescription: 'Studi kasus implementasi computer vision untuk quality control manufaktur. YOLOv8, edge deployment, dan hasil nyata.',
  },
  {
    title: 'NLP untuk Analisis Sentimen Bahasa Indonesia',
    slug: 'nlp-analisis-sentimen-bahasa-indonesia',
    excerpt: 'Membangun sistem analisis sentimen untuk review produk berbahasa Indonesia. Mulai dari text preprocessing, tokenisasi, hingga training model transformer.',
    content: `Analisis sentimen adalah salah satu aplikasi NLP paling populer dan berdampak bisnis langsung. Namun untuk Bahasa Indonesia, tantangannya unik: bahasa informal, slang, kode campuran (mixing Indonesian-English), dan kurangnya dataset publik berkualitas tinggi.

## Mengapa Bahasa Indonesia Menantang?

Beberapa karakteristik Bahasa Indonesia yang menyulitkan NLP:

- **Bahasa informal dan slang** — "gw", "bgt", "mantul", "worth it bgt" umum di review online
- **Code-mixing** — pencampuran Bahasa Indonesia dengan Bahasa Inggris dalam satu kalimat
- **Negasi kompleks** — "tidak terlalu buruk" sebenarnya bermakna positif
- **Sarkasme** — "bagus banget ya, baru sehari sudah rusak" memerlukan understanding konteks
- **Kurangnya standardisasi** — bahasa daerah dan akronim bervariasi antar platform

## Arsitektur Sistem

Pipeline analisis sentimen yang dibangun:

**Preprocessing → Tokenisasi → Feature Extraction → Model → Post-processing**

Setiap tahap memerlukan penanganan khusus untuk Bahasa Indonesia.

## Text Preprocessing

Preprocessing adalah fondasi penting. Langkah-langkah yang dilakukan:

\`\`\`python
import re

def preprocess_indonesian(text):
    # Lowercase
    text = text.lower()
    # Normalisasi slang
    text = normalize_slang(text, slang_dict)
    # Hapus URL, mentions, hashtags
    text = re.sub(r'http\\S+|@\\w+|#\\w+', '', text)
    # Hapus emotikon teks tapi simpan info sentimen
    text = convert_emoticons(text)
    # Hapus karakter berulang: "baguuuus" -> "bagus"
    text = re.sub(r'(.)\\1{2,}', r'\\1', text)
    return text.strip()
\`\`\`

**Kamus normalisasi slang** adalah komponen kritis. Kami mengompilasi 3000+ entri slang dari berbagai sumber: Kaskus, Twitter, forum online, dan dataset publik. Contoh:

- "gw" → "saya"
- "bgt" → "banget"
- "emg" → "memang"
- "ga" → "tidak"

## Pendekatan Model

Tiga pendekatan yang dieksplorasi:

**1. Traditional ML (TF-IDF + SVM)**

Sebagai baseline, model klasik masih memberikan hasil reasonable. TF-IDF menangkap frekuensi kata penting, dan SVM mempelajari decision boundary.

Akurasi: **82%** pada test set.

**2. IndoBERT (Transfer Learning)**

IndoBERT adalah model BERT yang di-pretrain pada korpus Bahasa Indonesia. Fine-tuning IndoBERT untuk sentiment analysis:

\`\`\`python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p1")
model = AutoModelForSequenceClassification.from_pretrained(
    "indobenchmark/indobert-base-p1",
    num_labels=3  # positif, negatif, netral
)
\`\`\`

Akurasi: **91%** pada test set — peningkatan signifikan dari baseline.

**3. IndoBERTweet (Domain-Specific)**

Untuk review dari media sosial, IndoBERTweet yang di-pretrain pada tweet Bahasa Indonesia memberikan performa lebih baik karena memahami bahasa informal.

Akurasi: **93.5%** pada test set review produk.

## Dataset dan Labeling

Dataset dikumpulkan dari 3 sumber:

- **Review Tokopedia:** 15.000 review produk elektronik
- **Review Google Play:** 8.000 review aplikasi
- **Tweet/post:** 7.000 mention brand di Twitter

Labeling dilakukan oleh 5 annotator native speaker dengan inter-annotator agreement (Cohen's Kappa) minimal 0.85. Skema label: Positif, Negatif, Netral.

## Handling Edge Cases

Kasus-kasus yang memerlukan perhatian khusus:

- **Review mixed sentiment:** "Kualitasnya bagus tapi pengirimannya lama banget" — memerlukan aspect-based sentiment analysis
- **Sarkasme:** Training data harus mencakup contoh sarkasme yang cukup
- **Bahasa daerah:** Model struggle dengan campuran bahasa daerah — perlu normalisasi tambahan
- **Review sangat pendek:** "ok", "bagus" — kurang konteks, tapi tetap harus ditangani

## Deployment sebagai API

Model di-deploy menggunakan FastAPI dengan batching untuk efisiensi:

- **Throughput:** 500 request/detik pada single GPU
- **Latency:** P99 di bawah 100ms
- **Monitoring:** Track prediction distribution untuk detect data drift
- Real-time dashboard menampilkan sentimen per produk, per waktu, dan per platform

## Dampak Bisnis

Sistem ini digunakan oleh tim product dan marketing:

- **Product team:** Mengidentifikasi masalah produk dari sentimen negatif clustering
- **Marketing team:** Memantau brand sentiment setelah campaign launch
- **Customer service:** Prioritaskan handling review negatif secara otomatis
- **Hasil:** Response time ke review negatif turun 60%, customer satisfaction naik 15%`,
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop',
    categorySlug: 'ai-engineering',
    tags: ['NLP', 'Sentiment Analysis', 'Bahasa Indonesia', 'BERT', 'Machine Learning'],
    readTime: '14 min',
    views: 4350,
    featured: false,
    publishedAt: '2024-11-20',
    metaTitle: 'NLP Analisis Sentimen Bahasa Indonesia — IndoBERT & Best Practices',
    metaDescription: 'Membangun analisis sentimen Bahasa Indonesia: preprocessing slang, IndoBERT fine-tuning, handling edge cases, dan deployment.',
  },
  {
    title: 'MLOps: Mengubah Prototipe ML Menjadi Produk Siap Deploy',
    slug: 'mlops-prototipe-ml-menjadi-produk-deploy',
    excerpt: 'Pipeline MLOps end-to-end: version control untuk model, automated training, CI/CD untuk ML, monitoring di production, dan mengatasi data drift.',
    content: `Sebagian besar proyek machine learning gagal bukan karena modelnya buruk, tetapi karena tidak bisa di-deploy dan di-maintain dengan baik. MLOps hadir untuk menjembatani gap antara eksperimen di notebook Jupyter dan produk ML yang reliable di production.

## Gap Antara Notebook dan Production

Dalam eksperimen, data scientist melatih model di Jupyter notebook, menggunakan dataset statis, dan mengevaluasi dengan metrik offline. Di production, realitanya sangat berbeda:

- Data berubah setiap saat (data drift)
- Model perlu di-update secara berkala
- Performa harus dimonitor real-time
- Multiple model versions harus dikelola
- Infrastructure harus scalable

> **Statistik:** Menurut Gartner, hanya 53% proyek ML yang berhasil dari prototipe ke production. MLOps bertujuan meningkatkan angka ini secara signifikan.

## Komponen Utama MLOps Pipeline

### 1. Version Control untuk Segalanya

Bukan hanya code yang perlu di-version, tetapi juga:

- **Data versioning** dengan DVC (Data Version Control)
- **Model registry** dengan MLflow untuk tracking setiap model version
- **Experiment tracking** — hyperparameters, metrics, artifacts
- **Pipeline versioning** — definisi pipeline sebagai code

\`\`\`yaml
# dvc.yaml - Pipeline definition as code
stages:
  preprocess:
    cmd: python src/preprocess.py
    deps:
      - data/raw/
    outs:
      - data/processed/
  train:
    cmd: python src/train.py
    deps:
      - data/processed/
    metrics:
      - metrics.json
    outs:
      - models/latest.pkl
\`\`\`

### 2. Automated Training Pipeline

Training pipeline yang reproducible dan otomatis:

- **Trigger-based training** — otomatis retrain ketika data baru tersedia
- **Hyperparameter tuning** — automated search menggunakan Optuna
- **Cross-validation** — evaluasi yang robust sebelum deployment
- **A/B comparison** — bandingkan model baru vs model yang sedang berjalan

### 3. CI/CD untuk ML

CI/CD untuk ML berbeda dari software tradisional. Selain unit test dan integration test, perlu:

- **Data validation** — cek schema, distribusi, dan missing values
- **Model validation** — pastikan performa di atas threshold minimum
- **Shadow deployment** — model baru menerima traffic tapi tidak mempengaruhi response
- **Canary release** — gradually route traffic ke model baru

### 4. Feature Store

Feature store menyimpan dan menyajikan fitur ML secara konsisten:

- **Offline store** — untuk training batch
- **Online store** — untuk serving real-time dengan latency rendah
- **Feature registry** — mencegah duplikasi fitur antar tim
- Tools populer: **Feast**, **Tecton**, atau custom solution di Redis

## Monitoring di Production

Setelah deploy, monitoring adalah hal wajib. Tiga tipe monitoring:

**Performance Monitoring:**
- Prediction accuracy, precision, recall
- Latency distribution (P50, P95, P99)
- Throughput dan error rate

**Data Monitoring:**
- Input data distribution vs training data distribution
- Missing values dan outliers
- Feature drift detection

**Operational Monitoring:**
- CPU/GPU utilization
- Memory usage
- Queue depth (jika async processing)

### Mendeteksi dan Mengatasi Data Drift

Data drift terjadi ketika distribusi data input berubah dari distribusi training data. Contoh: pola belanja berubah drastis saat pandemi.

Teknik deteksi:
- **Kolmogorov-Smirnov test** untuk numerical features
- **Chi-square test** untuk categorical features
- **Population Stability Index (PSI)** untuk overall distribution shift

Ketika drift terdeteksi:
1. Alert ke tim ML
2. Analisis root cause
3. Retrain dengan data terbaru
4. Validasi dan deploy model baru

## Tool Stack Rekomendasi

Untuk tim kecil-menengah, stack berikut sudah cukup powerful:

- **Experiment Tracking:** MLflow
- **Data Versioning:** DVC
- **Pipeline Orchestration:** Airflow atau Prefect
- **Model Serving:** FastAPI + Docker atau BentoML
- **Monitoring:** Prometheus + Grafana + custom drift detection
- **CI/CD:** GitHub Actions

MLOps bukan tentang mengadopsi semua tools sekaligus, tetapi tentang membangun proses yang iteratif dan semakin mature seiring pertumbuhan tim dan kompleksitas proyek.`,
    coverUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop',
    categorySlug: 'ai-engineering',
    tags: ['MLOps', 'Machine Learning', 'DevOps', 'Data Science', 'Deployment'],
    readTime: '15 min',
    views: 3890,
    featured: false,
    publishedAt: '2025-02-22',
    metaTitle: 'MLOps Pipeline End-to-End — Dari Prototipe ke Production',
    metaDescription: 'Pipeline MLOps lengkap: version control, automated training, CI/CD for ML, feature store, monitoring, dan data drift handling.',
  },
  {
    title: 'Prompt Engineering yang Efektif untuk Developer',
    slug: 'prompt-engineering-efektif-developer',
    excerpt: 'Teknik prompt engineering yang terbukti meningkatkan kualitas output LLM: chain-of-thought, few-shot, role prompting, dan structured output.',
    content: `Prompt engineering bukan sekadar menulis perintah ke ChatGPT. Bagi developer yang membangun aplikasi berbasis LLM, prompt engineering adalah skill fundamental yang menentukan kualitas dan reliabilitas output. Artikel ini membahas teknik-teknik yang terbukti efektif di production.

## Mengapa Prompt Engineering Penting?

Perbedaan antara prompt yang baik dan buruk bisa menghasilkan:
- **Akurasi output** yang berbeda hingga 40-60%
- **Konsistensi format** yang reliable vs output yang randon
- **Pengurangan hallucination** yang signifikan
- **Penghematan token** yang langsung berdampak ke biaya

## Teknik Dasar yang Sering Diabaikan

### 1. Berikan Konteks yang Jelas

Prompt tanpa konteks menghasilkan output generik. Selalu sertakan:

- **Role** — siapa AI dalam skenario ini
- **Context** — latar belakang situasi
- **Task** — apa yang harus dilakukan secara spesifik
- **Format** — bagaimana output harus distrukturkan

\`\`\`
Kamu adalah senior software engineer yang melakukan code review.
Konteks: Ini adalah codebase Node.js untuk REST API e-commerce.
Task: Review kode berikut dan identifikasi masalah keamanan.
Format: Berikan daftar masalah dengan severity (HIGH/MEDIUM/LOW)
dan saran perbaikan untuk masing-masing.
\`\`\`

### 2. Few-Shot Prompting

Berikan contoh input-output yang diharapkan. LLM belajar pola dari contoh yang diberikan.

\`\`\`
Ubah deskripsi fitur menjadi user story:

Input: "User bisa filter produk berdasarkan harga"
Output: "Sebagai pembeli, saya ingin memfilter produk berdasarkan
rentang harga, sehingga saya dapat menemukan produk sesuai budget."

Input: "Admin bisa melihat laporan penjualan bulanan"
Output:
\`\`\`

2-3 contoh biasanya cukup untuk task sederhana. Untuk task kompleks, 5-7 contoh memberikan hasil lebih konsisten.

## Teknik Lanjutan

### Chain-of-Thought (CoT)

Minta model berpikir langkah demi langkah sebelum memberikan jawaban final. Ini sangat efektif untuk reasoning tasks.

\`\`\`
Analisis apakah query SQL berikut bisa menyebabkan performance
issue pada tabel dengan 10 juta rows.

Pikirkan langkah demi langkah:
1. Identifikasi operasi yang dilakukan
2. Cek apakah ada full table scan
3. Evaluasi penggunaan index
4. Perkirakan execution time
5. Berikan rekomendasi perbaikan

Query: SELECT * FROM orders WHERE status = 'pending'
AND created_at > '2024-01-01' ORDER BY total DESC;
\`\`\`

### Structured Output

Ketika membangun aplikasi yang mem-parse output LLM, gunakan format terstruktur:

\`\`\`
Analisis sentimen teks berikut.
Berikan output HANYA dalam format JSON berikut, tanpa tambahan:

{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": 0.0-1.0,
  "keywords": ["kata1", "kata2"],
  "reasoning": "penjelasan singkat"
}
\`\`\`

### Self-Consistency

Generate beberapa jawaban untuk satu pertanyaan, lalu ambil mayoritas. Teknik ini meningkatkan reliability untuk task yang membutuhkan reasoning.

## Prompt Engineering untuk Production

Beberapa best practices untuk aplikasi production:

**Prompt versioning:**
- Simpan prompt di file terpisah, bukan hardcode
- Version control seperti code
- A/B test antara prompt versions

**Guard rails:**
- Validasi output format sebelum digunakan
- Fallback mechanism jika output tidak sesuai
- Retry logic dengan reformulasi prompt

**Temperature dan parameter:**
- **Temperature 0-0.3:** untuk task yang membutuhkan konsistensi (classification, extraction)
- **Temperature 0.5-0.7:** untuk task kreatif yang tetap terkontrol (content generation)
- **Temperature 0.8-1.0:** untuk brainstorming dan ide

**Cost optimization:**
- Gunakan model yang sesuai — tidak semua task butuh GPT-4
- Caching response untuk query yang identik atau mirip
- Batching request ketika memungkinkan

## Anti-Patterns yang Harus Dihindari

- **Prompt terlalu panjang** — LLM kehilangan fokus pada konteks yang terlalu banyak
- **Instruksi ambigu** — "buat yang bagus" tidak memberikan guidance
- **Tidak ada contoh** — model menebak format yang diharapkan
- **Mengabaikan system prompt** — system prompt memberikan konteks persisten yang sangat berpengaruh

Prompt engineering yang baik adalah iteratif. Mulai dengan prompt sederhana, evaluasi hasilnya, identifikasi kelemahan, dan refine secara bertahap hingga mencapai kualitas yang diinginkan.`,
    coverUrl: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=1200&h=630&fit=crop',
    categorySlug: 'ai-engineering',
    tags: ['Prompt Engineering', 'LLM', 'AI', 'GPT', 'Developer Tools'],
    readTime: '11 min',
    views: 7820,
    featured: false,
    publishedAt: '2025-01-05',
    metaTitle: 'Prompt Engineering untuk Developer — Teknik yang Terbukti Efektif',
    metaDescription: 'Teknik prompt engineering: chain-of-thought, few-shot, structured output, dan best practices untuk aplikasi production.',
  },
  {
    title: 'Membangun Recommendation System dengan Collaborative Filtering',
    slug: 'recommendation-system-collaborative-filtering',
    excerpt: 'Implementasi recommendation system dari nol menggunakan collaborative filtering, matrix factorization, dan hybrid approach. Studi kasus pada platform e-commerce.',
    content: `Recommendation system adalah salah satu aplikasi machine learning dengan dampak bisnis paling langsung. Netflix memperkirakan 80% konten yang ditonton berasal dari rekomendasi. Amazon melaporkan 35% revenue berasal dari fitur "Customers who bought this also bought." Artikel ini membahas implementasi praktis dari nol.

## Tipe-Tipe Pendekatan Rekomendasi

Tiga pendekatan utama:

**1. Content-Based Filtering**
Merekomendasikan item yang mirip dengan item yang disukai user sebelumnya. Berdasarkan fitur item (genre, kategori, deskripsi).

**2. Collaborative Filtering**
Merekomendasikan berdasarkan perilaku pengguna yang serupa. Tidak perlu memahami konten, hanya perlu data interaksi user-item.

**3. Hybrid**
Menggabungkan keduanya untuk mengatasi kelemahan masing-masing. Ini pendekatan yang paling umum di production.

## User-Based Collaborative Filtering

Logikanya sederhana: jika User A dan User B memiliki preferensi yang mirip, item yang disukai User B tapi belum dilihat User A kemungkinan akan disukai User A juga.

\`\`\`python
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# User-item interaction matrix
# Rows = users, Columns = items, Values = ratings
user_item_matrix = np.array([
    [5, 3, 0, 1, 4],
    [4, 0, 0, 1, 5],
    [1, 1, 0, 5, 0],
    [0, 0, 5, 4, 0],
    [0, 3, 4, 0, 0],
])

# Hitung similarity antar users
user_similarity = cosine_similarity(user_item_matrix)
\`\`\`

**Kelemahan:** Tidak scalable untuk jutaan users. Menghitung similarity untuk semua pasangan user menjadi sangat mahal secara komputasi.

## Item-Based Collaborative Filtering

Alih-alih menghitung similarity antar users, kita menghitung similarity antar items berdasarkan bagaimana users menilai mereka. Pendekatan ini lebih scalable karena jumlah item biasanya lebih kecil dan lebih stabil dari jumlah user.

> Amazon menggunakan item-based CF sebagai basis sistem rekomendasi mereka karena catalog item lebih stabil dibanding perilaku user yang terus berubah.

## Matrix Factorization dengan SVD

Singular Value Decomposition memecah user-item matrix menjadi matriks laten yang lebih kecil, menangkap hidden factors di balik preferensi user.

\`\`\`python
from surprise import SVD, Dataset, Reader

reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(ratings_df[['userId', 'itemId', 'rating']], reader)

model = SVD(n_factors=100, n_epochs=20, lr_all=0.005, reg_all=0.02)
model.fit(trainset)

# Prediksi rating
prediction = model.predict(uid='user_123', iid='item_456')
\`\`\`

Parameter penting:
- **n_factors:** Jumlah latent factors (50-200, semakin besar semakin expressif tapi risiko overfitting)
- **regularization:** Mencegah overfitting, terutama penting untuk sparse data
- **learning rate:** Kecepatan konvergensi

## Cold Start Problem

Tantangan terbesar collaborative filtering adalah cold start — tidak ada data interaksi untuk user atau item baru. Solusi:

- **New user:** Gunakan content-based filtering berdasarkan profil, atau minta user memilih preferensi saat onboarding
- **New item:** Gunakan fitur item (kategori, deskripsi) untuk menghitung similarity awal
- **Popularity fallback:** Untuk user/item yang benar-benar baru, tampilkan item populer

## Evaluasi Offline dan Online

**Metrik offline:**
- **RMSE:** Seberapa akurat prediksi rating
- **Precision@K:** Dari K item yang direkomendasikan, berapa yang relevan
- **Recall@K:** Dari semua item relevan, berapa yang berhasil direkomendasikan
- **NDCG:** Mempertimbangkan posisi ranking item relevan

**Metrik online (A/B Test):**
- Click-through rate (CTR)
- Conversion rate
- Revenue per session
- User engagement time

## Implementasi Production

Arsitektur production recommendation system:

**Offline pipeline (harian/mingguan):**
- Retrain model dengan data terbaru
- Generate top-N candidates untuk setiap user
- Simpan di cache (Redis)

**Online serving (real-time):**
- Ambil candidates dari cache
- Re-rank berdasarkan konteks real-time (waktu, device, recent activity)
- Filter yang sudah dilihat/dibeli
- Return top recommendations

Pada proyek e-commerce dengan 500K users dan 50K products, hybrid recommendation system meningkatkan conversion rate 23% dan average order value 15% dibandingkan sistem sebelumnya yang hanya menggunakan popularity-based ranking.`,
    coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    categorySlug: 'ai-engineering',
    tags: ['Recommendation System', 'Collaborative Filtering', 'Machine Learning', 'E-Commerce', 'Python'],
    readTime: '13 min',
    views: 3670,
    featured: false,
    publishedAt: '2024-12-08',
    metaTitle: 'Recommendation System Collaborative Filtering — Panduan Implementasi',
    metaDescription: 'Implementasi recommendation system: collaborative filtering, matrix factorization, cold start solution, dan evaluasi A/B testing.',
  },
  {
    title: 'Edge AI: Menjalankan Model ML di Perangkat IoT',
    slug: 'edge-ai-model-ml-perangkat-iot',
    excerpt: 'Panduan mengoptimasi dan deploy model machine learning di perangkat edge seperti Raspberry Pi dan NVIDIA Jetson. Teknik quantization, pruning, dan knowledge distillation.',
    content: `Edge AI memungkinkan inference ML langsung di perangkat IoT tanpa mengirim data ke cloud. Ini memberikan tiga keuntungan utama: **latency ultra-rendah**, **operasi offline**, dan **privasi data**. Namun, menjalankan ML di perangkat dengan resource terbatas memerlukan teknik optimasi khusus.

## Mengapa Edge AI?

Beberapa skenario di mana Edge AI menjadi keharusan:

- **Real-time processing** — deteksi objek di kamera security membutuhkan respon < 100ms
- **Bandwidth limitation** — mengirim video HD ke cloud membutuhkan bandwidth yang tidak selalu tersedia
- **Privacy compliance** — data sensitif (wajah, medical images) tidak boleh meninggalkan perangkat
- **Reliability** — sistem harus berjalan bahkan ketika koneksi internet putus

## Platform Edge Computing

### Raspberry Pi 5

- **Use case:** IoT prototyping, inference ringandalam
- **Compute:** Quad-core ARM Cortex-A76, 8GB RAM
- **ML acceleration:** Coral USB Accelerator atau Hailo-8L M.2 module
- **OS:** Raspberry Pi OS (Debian-based)
- **Cocok untuk:** Object detection ringan, sound classification, anomaly detection

### NVIDIA Jetson Orin Nano

- **Use case:** Computer vision, edge AI production
- **Compute:** 6-core ARM, 1024-core NVIDIA GPU, 8GB unified memory
- **ML acceleration:** Built-in CUDA cores + Tensor Cores
- **Framework:** TensorRT, DeepStream
- **Cocok untuk:** Multi-camera video analytics, real-time detection

## Teknik Optimasi Model

### 1. Quantization

Mengurangi precision model dari FP32 ke INT8 atau bahkan INT4. Dampak:

\`\`\`
FP32 (default) → Model size 100%, Speed 1x, Accuracy 100%
FP16           → Model size  50%, Speed 2x, Accuracy ~99.5%
INT8           → Model size  25%, Speed 4x, Accuracy ~98%
INT4           → Model size  12%, Speed 8x, Accuracy ~95%
\`\`\`

\`\`\`python
import tensorflow as tf

converter = tf.lite.TFLiteConverter.from_saved_model('model/')
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.int8]

# Kalibrasi dengan representative dataset
def representative_data():
    for data in calibration_dataset:
        yield [data]

converter.representative_dataset = representative_data
tflite_model = converter.convert()
\`\`\`

### 2. Pruning

Menghapus weight yang nilainya mendekati nol (tidak kontributif). Structured pruning menghapus seluruh channel atau layer, sementara unstructured pruning menghapus individual weights.

- **Pruning 50%** weight biasanya hanya menyebabkan penurunan akurasi 1-2%
- Setelah pruning, lakukan fine-tuning beberapa epoch untuk recovery

### 3. Knowledge Distillation

Melatih model kecil (student) untuk meniru perilaku model besar (teacher). Student model belajar probabilitas output teacher, bukan hanya hard labels.

- **Teacher:** ResNet-152 (60M parameters, akurasi 95%)
- **Student:** MobileNetV3 (5M parameters, akurasi 92% setelah distillation)

Tanpa distillation, MobileNetV3 hanya mencapai akurasi 88%.

## Optimasi untuk TensorRT

Untuk NVIDIA Jetson, TensorRT memberikan speedup signifikan:

\`\`\`python
import tensorrt as trt

# Convert ONNX model to TensorRT engine
builder = trt.Builder(logger)
network = builder.create_network()
parser = trt.OnnxParser(network, logger)

config = builder.create_builder_config()
config.set_flag(trt.BuilderFlag.FP16)  # Enable FP16 mode

engine = builder.build_serialized_network(network, config)
\`\`\`

TensorRT mengoptimasi computational graph: layer fusion, kernel autotuning, dan memory optimization. Speedup tipikal: **2-5x** dibanding PyTorch native inference.

## Monitoring di Edge

> Perangkat edge tidak memiliki luxury monitoring yang sama dengan cloud. Namun monitoring tetap kritis.

Metrik yang harus ditrack:

- **Inference latency** per frame/request
- **CPU/GPU temperature** — throttling bisa terjadi saat overhead
- **Memory usage** — memory leak di edge bisa fatal
- **Prediction confidence distribution** — drop confidence bisa mengindikasikan model degradation

Gunakan lightweight logging ke local storage dan periodic sync ke cloud untuk analisis.

## Power Management

Di perangkat battery-powered, efisiensi energi kritis:

- **Duty cycling** — aktifkan inference hanya saat ada input (motion detection trigger)
- **Dynamic model switching** — gunakan model ringan saat battery rendah
- **Hardware acceleration** — gunakan NPU/TPU dedicated daripada CPU untuk inference

Pada proyek smart agriculture, Edge AI system menjalankan plant disease detection di Raspberry Pi dengan Coral accelerator. Sistem berjalan 24/7 di lapangan dengan solar panel, memproses 500 gambar/hari dengan akurasi deteksi 96.2% dan konsumsi daya rata-rata hanya 8W.`,
    coverUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=630&fit=crop',
    categorySlug: 'ai-engineering',
    tags: ['Edge AI', 'IoT', 'TensorRT', 'Raspberry Pi', 'Model Optimization'],
    readTime: '14 min',
    views: 4210,
    featured: false,
    publishedAt: '2025-02-01',
    metaTitle: 'Edge AI — Deploy ML di Raspberry Pi & Jetson dengan TensorRT',
    metaDescription: 'Panduan Edge AI: quantization, pruning, knowledge distillation, TensorRT optimization, dan deployment di perangkat IoT.',
  },
];
