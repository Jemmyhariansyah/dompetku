"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TransactionType = "expense" | "income";

type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
  payment: string;
  createdAt: string;
};

type TransactionForm = Omit<Transaction, "id" | "createdAt">;

type StoredData = {
  version: 1;
  budget: number;
  transactions: Transaction[];
};

const STORAGE_KEY = "catatuang-pribadi-v1";

const EXPENSE_CATEGORIES = [
  { name: "Makanan", color: "#f59e0b", icon: "🍜" },
  { name: "Transportasi", color: "#3b82f6", icon: "🚕" },
  { name: "Tagihan", color: "#8b5cf6", icon: "⚡" },
  { name: "Belanja", color: "#ec4899", icon: "🛍" },
  { name: "Kesehatan", color: "#ef4444", icon: "✚" },
  { name: "Hiburan", color: "#14b8a6", icon: "🎬" },
  { name: "Pendidikan", color: "#6366f1", icon: "📚" },
  { name: "Lainnya", color: "#64748b", icon: "•••" },
];

const INCOME_CATEGORIES = [
  { name: "Gaji", color: "#10b981", icon: "💼" },
  { name: "Bonus", color: "#22c55e", icon: "★" },
  { name: "Investasi", color: "#06b6d4", icon: "↗" },
  { name: "Lainnya", color: "#64748b", icon: "•••" },
];

const PAYMENTS = ["Tunai", "Transfer Bank", "Kartu Debit", "E-Wallet"];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-001",
    type: "income",
    amount: 8500000,
    category: "Gaji",
    date: "2026-07-01",
    note: "Gaji bulanan",
    payment: "Transfer Bank",
    createdAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "tx-002",
    type: "expense",
    amount: 1250000,
    category: "Tagihan",
    date: "2026-07-03",
    note: "Kontrakan dan listrik",
    payment: "Transfer Bank",
    createdAt: "2026-07-03T09:00:00.000Z",
  },
  {
    id: "tx-003",
    type: "expense",
    amount: 485000,
    category: "Makanan",
    date: "2026-07-06",
    note: "Belanja kebutuhan dapur",
    payment: "Kartu Debit",
    createdAt: "2026-07-06T11:00:00.000Z",
  },
  {
    id: "tx-004",
    type: "expense",
    amount: 220000,
    category: "Transportasi",
    date: "2026-07-09",
    note: "Bensin dan parkir",
    payment: "E-Wallet",
    createdAt: "2026-07-09T13:00:00.000Z",
  },
  {
    id: "tx-005",
    type: "expense",
    amount: 375000,
    category: "Hiburan",
    date: "2026-07-12",
    note: "Nonton dan makan bersama",
    payment: "E-Wallet",
    createdAt: "2026-07-12T14:00:00.000Z",
  },
  {
    id: "tx-006",
    type: "income",
    amount: 750000,
    category: "Bonus",
    date: "2026-07-15",
    note: "Bonus proyek",
    payment: "Transfer Bank",
    createdAt: "2026-07-15T08:00:00.000Z",
  },
  {
    id: "tx-007",
    type: "expense",
    amount: 340000,
    category: "Belanja",
    date: "2026-07-18",
    note: "Perlengkapan kerja",
    payment: "Kartu Debit",
    createdAt: "2026-07-18T09:00:00.000Z",
  },
  {
    id: "tx-008",
    type: "expense",
    amount: 165000,
    category: "Kesehatan",
    date: "2026-07-21",
    note: "Vitamin dan obat",
    payment: "Tunai",
    createdAt: "2026-07-21T10:00:00.000Z",
  },
];

const initialForm: TransactionForm = {
  type: "expense",
  amount: 0,
  category: "Makanan",
  date: "2026-07-23",
  note: "",
  payment: "Tunai",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) {
    return `Rp${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} jt`;
  }
  if (value >= 1_000) return `Rp${Math.round(value / 1_000)} rb`;
  return `Rp${value}`;
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function monthLabel(value: string, short = false) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: short ? "short" : "long",
    year: short ? undefined : "numeric",
  }).format(new Date(year, month - 1, 1));
}

function categoryMeta(category: string, type: TransactionType) {
  const list = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  return (
    list.find((item) => item.name === category) ?? {
      name: category,
      color: "#64748b",
      icon: "•••",
    }
  );
}

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Transaction>;
  return (
    typeof item.id === "string" &&
    (item.type === "expense" || item.type === "income") &&
    typeof item.amount === "number" &&
    typeof item.category === "string" &&
    typeof item.date === "string" &&
    typeof item.note === "string" &&
    typeof item.payment === "string" &&
    typeof item.createdAt === "string"
  );
}

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function FinanceApp() {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [budget, setBudget] = useState(5000000);
  const [budgetDraft, setBudgetDraft] = useState("5000000");
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const restoreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<StoredData>;
          if (Array.isArray(saved.transactions) && saved.transactions.every(isTransaction)) {
            if (!cancelled) setTransactions(saved.transactions);
          }
          if (typeof saved.budget === "number" && saved.budget >= 0) {
            if (!cancelled) {
              setBudget(saved.budget);
              setBudgetDraft(String(saved.budget));
            }
          }
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: StoredData = {
      version: 1,
      budget,
      transactions,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [budget, hydrated, transactions]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const monthTransactions = useMemo(() => transactions.filter((item) => item.date.startsWith(selectedMonth)), [selectedMonth, transactions]);

  const metrics = useMemo(() => {
    const income = monthTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const expense = monthTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
    return { income, expense, balance, savingsRate };
  }, [monthTransactions]);

  const expenseByCategory = useMemo(() => {
    return EXPENSE_CATEGORIES.map((category) => ({
      ...category,
      value: monthTransactions.filter((item) => item.type === "expense" && item.category === category.name).reduce((sum, item) => sum + item.amount, 0),
    }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions]);

  const availableCategories = useMemo(() => [...new Set(transactions.filter((item) => item.date.startsWith(selectedMonth)).map((item) => item.category))].sort(), [selectedMonth, transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return monthTransactions
      .filter((item) => {
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        const matchesSearch = !query || [item.note, item.category, item.payment].join(" ").toLowerCase().includes(query);
        return matchesType && matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [categoryFilter, monthTransactions, search, typeFilter]);

  const budgetUsed = budget > 0 ? Math.min(100, Math.round((metrics.expense / budget) * 100)) : 0;

  const donutBackground = useMemo(() => {
    const total = Math.max(1, metrics.expense);
    const stops = expenseByCategory.reduce<{
      offset: number;
      values: string[];
    }>(
      (current, item) => {
        const end = current.offset + (item.value / total) * 100;
        return {
          offset: end,
          values: [...current.values, `${item.color} ${current.offset}% ${end}%`],
        };
      },
      { offset: 0, values: [] }
    ).values;
    if (!stops.length) return "conic-gradient(#e7edf5 0 100%)";
    return `conic-gradient(${stops.join(",")})`;
  }, [expenseByCategory, metrics.expense]);

  const monthTrend = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(year, month - 1 - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const income = transactions.filter((item) => item.type === "income" && item.date.startsWith(key)).reduce((sum, item) => sum + item.amount, 0);
      const expense = transactions.filter((item) => item.type === "expense" && item.date.startsWith(key)).reduce((sum, item) => sum + item.amount, 0);
      return { key, label: monthLabel(key, true), income, expense };
    });
  }, [selectedMonth, transactions]);

  const maxTrend = Math.max(1, ...monthTrend.flatMap((item) => [item.income, item.expense]));

  function openCreate(type: TransactionType = "expense") {
    setEditingId(null);
    setForm({
      ...initialForm,
      type,
      category: type === "expense" ? "Makanan" : "Gaji",
      date: `${selectedMonth}-${String(new Date().getDate()).padStart(2, "0")}`,
    });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      note: transaction.note,
      payment: transaction.payment,
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setFormError("");
  }

  function changeType(type: TransactionType) {
    setForm((current) => ({
      ...current,
      type,
      category: type === "expense" ? "Makanan" : "Gaji",
    }));
  }

  function saveTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.amount || form.amount <= 0) {
      setFormError("Nominal transaksi harus lebih besar dari nol.");
      return;
    }
    if (!form.note.trim()) {
      setFormError("Tambahkan keterangan transaksi.");
      return;
    }

    if (editingId) {
      setTransactions((current) => current.map((item) => (item.id === editingId ? { ...item, ...form } : item)));
      setToast("Transaksi berhasil diperbarui.");
    } else {
      const created: Transaction = {
        ...form,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((current) => [created, ...current]);
      setToast("Transaksi berhasil dicatat.");
    }
    closeModal();
  }

  function deleteTransaction(transaction: Transaction) {
    if (!window.confirm(`Hapus transaksi “${transaction.note}” senilai ${formatCurrency(transaction.amount)}?`)) {
      return;
    }
    setTransactions((current) => current.filter((item) => item.id !== transaction.id));
    setToast("Transaksi telah dihapus.");
  }

  function saveBudget() {
    const value = Number(budgetDraft);
    if (!Number.isFinite(value) || value < 0) {
      setToast("Nominal anggaran tidak valid.");
      return;
    }
    setBudget(value);
    setToast("Anggaran bulanan diperbarui.");
  }

  function exportCsv() {
    const header = ["Tanggal", "Jenis", "Kategori", "Keterangan", "Metode Pembayaran", "Nominal"];
    const rows = filteredTransactions.map((item) => [item.date, item.type === "expense" ? "Pengeluaran" : "Pemasukan", item.category, item.note, item.payment, item.amount]);
    const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
    downloadBlob(`\uFEFF${csv}`, "text/csv;charset=utf-8", `catatuang-${selectedMonth}.csv`);
    setToast("Laporan CSV berhasil dibuat.");
  }

  function backupData() {
    const payload: StoredData = { version: 1, budget, transactions };
    downloadBlob(JSON.stringify(payload, null, 2), "application/json", `backup-catatuang-${new Date().toISOString().slice(0, 10)}.json`);
    setToast("Backup data berhasil dibuat.");
  }

  async function restoreData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Partial<StoredData>;
      if (!Array.isArray(parsed.transactions) || !parsed.transactions.every(isTransaction) || typeof parsed.budget !== "number") {
        throw new Error("Format file backup tidak sesuai.");
      }
      if (!window.confirm(`Pulihkan ${parsed.transactions.length} transaksi? Data saat ini akan diganti.`)) {
        return;
      }
      setTransactions(parsed.transactions);
      setBudget(parsed.budget);
      setBudgetDraft(String(parsed.budget));
      setToast("Data berhasil dipulihkan.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Backup tidak dapat dibaca.");
    }
  }

  return (
    <div className="finance-app">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            D
          </div>
          <div>
            <strong>DompetKu</strong>
            <span>Personal Finance</span>
          </div>
        </div>

        <nav aria-label="Navigasi utama">
          <a className="nav-item active" href="#ringkasan">
            <span>⌂</span> Ringkasan
          </a>
          <a className="nav-item" href="#transaksi">
            <span>↕</span> Transaksi
          </a>
          <a className="nav-item" href="#anggaran">
            <span>◎</span> Anggaran
          </a>
          <a className="nav-item" href="#laporan">
            <span>▥</span> Laporan
          </a>
        </nav>

        <div className="privacy-card">
          <div className="privacy-icon">✓</div>
          <strong>Data tetap privat</strong>
          <p>Seluruh catatan tersimpan hanya di browser perangkat ini.</p>
        </div>

        <div className="sidebar-footer">
          <span>DompetKu v1.0</span>
          <small>Siap untuk GitHub Pages</small>
        </div>
      </aside>

      <button className="sidebar-scrim" aria-label="Tutup menu" onClick={() => setMobileNavOpen(false)} />

      <main className="main-area">
        <header className="app-header">
          <button className="menu-button" aria-label="Buka menu" onClick={() => setMobileNavOpen(true)}>
            ☰
          </button>
          <div className="welcome">
            <p>Keuangan pribadi</p>
            <h1>Halo, mari atur uangmu 👋</h1>
          </div>
          <div className="header-tools">
            <label className="month-picker">
              <span>Periode</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => {
                  setSelectedMonth(event.target.value);
                  setCategoryFilter("all");
                }}
              />
            </label>
            <button className="primary-button" onClick={() => openCreate()}>
              <span>＋</span> Catat Transaksi
            </button>
          </div>
        </header>

        <section id="ringkasan" className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Ringkasan {monthLabel(selectedMonth)}</span>
              <h2>Kondisi keuangan bulan ini</h2>
            </div>
            <span className="storage-status">
              <i /> {hydrated ? "Tersimpan otomatis" : "Menyiapkan data…"}
            </span>
          </div>

          <div className="metric-grid">
            <article className="metric-card balance-card">
              <div className="metric-top">
                <span>Saldo bulan ini</span>
                <span className="metric-icon">◈</span>
              </div>
              <strong>{formatCurrency(metrics.balance)}</strong>
              <small>{metrics.balance >= 0 ? "Arus kas masih positif" : "Pengeluaran melebihi pemasukan"}</small>
            </article>
            <article className="metric-card">
              <div className="metric-top">
                <span>Total pemasukan</span>
                <span className="metric-icon income">↙</span>
              </div>
              <strong>{formatCurrency(metrics.income)}</strong>
              <small className="positive">{monthTransactions.filter((item) => item.type === "income").length} transaksi masuk</small>
            </article>
            <article className="metric-card">
              <div className="metric-top">
                <span>Total pengeluaran</span>
                <span className="metric-icon expense">↗</span>
              </div>
              <strong>{formatCurrency(metrics.expense)}</strong>
              <small>{monthTransactions.filter((item) => item.type === "expense").length} transaksi keluar</small>
            </article>
            <article className="metric-card">
              <div className="metric-top">
                <span>Rasio tabungan</span>
                <span className="metric-icon saving">%</span>
              </div>
              <strong>{metrics.savingsRate}%</strong>
              <small>{metrics.savingsRate >= 20 ? "Bagus, pertahankan kebiasaan ini" : "Target sehat: minimal 20%"}</small>
            </article>
          </div>

          <div className="insight-grid">
            <article className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Tren arus kas</span>
                  <h3>Perbandingan 6 bulan</h3>
                </div>
                <div className="legend">
                  <span>
                    <i className="income-dot" /> Pemasukan
                  </span>
                  <span>
                    <i className="expense-dot" /> Pengeluaran
                  </span>
                </div>
              </div>
              <div className="bar-chart" aria-label="Grafik pemasukan dan pengeluaran enam bulan">
                {monthTrend.map((item) => (
                  <div className="bar-group" key={item.key}>
                    <div className="bars">
                      <span className="bar bar-income" style={{ height: `${Math.max(3, (item.income / maxTrend) * 100)}%` }} title={`Pemasukan ${formatCurrency(item.income)}`} />
                      <span className="bar bar-expense" style={{ height: `${Math.max(3, (item.expense / maxTrend) * 100)}%` }} title={`Pengeluaran ${formatCurrency(item.expense)}`} />
                    </div>
                    <small>{item.label}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel category-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Komposisi</span>
                  <h3>Pengeluaran per kategori</h3>
                </div>
                <span className="panel-total">{formatCompactCurrency(metrics.expense)}</span>
              </div>
              <div className="category-content">
                <div className="donut" style={{ background: donutBackground }}>
                  <div>
                    <strong>{expenseByCategory.length}</strong>
                    <span>kategori</span>
                  </div>
                </div>
                <div className="category-list">
                  {expenseByCategory.length ? (
                    expenseByCategory.slice(0, 5).map((item) => (
                      <div className="category-row" key={item.name}>
                        <span className="category-name">
                          <i style={{ background: item.color }} /> {item.name}
                        </span>
                        <strong>{formatCompactCurrency(item.value)}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="empty-copy">Belum ada pengeluaran pada periode ini.</p>
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="anggaran" className="budget-panel">
          <div className="budget-copy">
            <span className="budget-icon">◎</span>
            <div>
              <span className="eyebrow">Kontrol pengeluaran</span>
              <h3>Anggaran bulanan</h3>
              <p>
                Terpakai {formatCurrency(metrics.expense)} dari {formatCurrency(budget)}
              </p>
            </div>
          </div>
          <div className="budget-progress-wrap">
            <div className="budget-progress-meta">
              <span>{budgetUsed}% terpakai</span>
              <strong>Sisa {formatCurrency(Math.max(0, budget - metrics.expense))}</strong>
            </div>
            <div className="progress-track">
              <span className={budgetUsed >= 90 ? "danger-progress" : ""} style={{ width: `${budgetUsed}%` }} />
            </div>
          </div>
          <div className="budget-edit">
            <label>
              <span>Target anggaran</span>
              <input type="number" min="0" step="50000" value={budgetDraft} onChange={(event) => setBudgetDraft(event.target.value)} />
            </label>
            <button onClick={saveBudget}>Simpan</button>
          </div>
        </section>

        <section id="transaksi" className="panel transaction-panel">
          <div className="panel-heading transaction-heading">
            <div>
              <span className="eyebrow">Aktivitas keuangan</span>
              <h3>Daftar transaksi</h3>
              <p>{filteredTransactions.length} transaksi ditampilkan</p>
            </div>
            <div className="quick-actions">
              <button onClick={() => openCreate("income")}>＋ Pemasukan</button>
              <button className="quick-expense" onClick={() => openCreate("expense")}>
                − Pengeluaran
              </button>
            </div>
          </div>

          <div className="filters">
            <label className="search-field">
              <span className="sr-only">Cari transaksi</span>
              <i>⌕</i>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari keterangan, kategori, metode…" />
            </label>
            <label>
              <span className="sr-only">Filter jenis transaksi</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="all">Semua jenis</option>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Filter kategori</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">Semua kategori</option>
                {availableCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="transaction-list">
            {filteredTransactions.length ? (
              filteredTransactions.map((transaction) => {
                const meta = categoryMeta(transaction.category, transaction.type);
                return (
                  <article className="transaction-item" key={transaction.id}>
                    <span className="transaction-icon" style={{ background: `${meta.color}18`, color: meta.color }}>
                      {meta.icon}
                    </span>
                    <div className="transaction-main">
                      <strong>{transaction.note}</strong>
                      <span>
                        {transaction.category} · {transaction.payment}
                      </span>
                    </div>
                    <time dateTime={transaction.date}>{formatDate(transaction.date)}</time>
                    <strong className={transaction.type === "income" ? "amount income-amount" : "amount"}>
                      {transaction.type === "income" ? "+" : "−"}
                      {formatCurrency(transaction.amount)}
                    </strong>
                    <div className="row-actions">
                      <button aria-label={`Edit ${transaction.note}`} onClick={() => openEdit(transaction)}>
                        Edit
                      </button>
                      <button className="delete-button" aria-label={`Hapus ${transaction.note}`} onClick={() => deleteTransaction(transaction)}>
                        Hapus
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                <span>✦</span>
                <h4>Belum ada transaksi</h4>
                <p>Ubah filter atau catat transaksi baru untuk periode ini.</p>
                <button className="primary-button" onClick={() => openCreate()}>
                  ＋ Catat Transaksi
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="laporan" className="report-panel">
          <div>
            <span className="eyebrow">Backup dan laporan</span>
            <h3>Data milikmu, kendali tetap di tanganmu</h3>
            <p>Unduh laporan atau buat backup rutin agar catatan dapat dipindahkan ke perangkat lain.</p>
          </div>
          <div className="report-actions">
            <button onClick={exportCsv}>Unduh CSV</button>
            <button onClick={backupData}>Backup JSON</button>
            <button onClick={() => restoreRef.current?.click()}>Pulihkan Data</button>
            <input ref={restoreRef} className="sr-only" type="file" accept=".json,application/json" onChange={restoreData} tabIndex={-1} />
          </div>
        </section>

        <footer>
          <span>© 2026 DompetKu · Pencatatan keuangan pribadi</span>
          <span>Data disimpan lokal di perangkat Anda</span>
        </footer>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{editingId ? "Perbarui catatan" : "Catatan baru"}</span>
                <h2 id="transaction-modal-title">{editingId ? "Edit transaksi" : "Catat transaksi"}</h2>
              </div>
              <button aria-label="Tutup" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={saveTransaction}>
              <div className="type-switch" aria-label="Jenis transaksi">
                <button type="button" className={form.type === "expense" ? "selected expense-selected" : ""} onClick={() => changeType("expense")}>
                  Pengeluaran
                </button>
                <button type="button" className={form.type === "income" ? "selected income-selected" : ""} onClick={() => changeType("income")}>
                  Pemasukan
                </button>
              </div>

              <label className="form-field amount-field">
                <span>Nominal *</span>
                <div>
                  <b>Rp</b>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.amount || ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: Number(event.target.value),
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </label>

              <div className="form-grid">
                <label className="form-field">
                  <span>Tanggal *</span>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Kategori *</span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                  >
                    {(form.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((category) => (
                      <option key={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field field-wide">
                  <span>Keterangan *</span>
                  <input
                    required
                    value={form.note}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    placeholder="Contoh: Makan siang bersama tim"
                  />
                </label>
                <label className="form-field field-wide">
                  <span>Metode pembayaran</span>
                  <select
                    value={form.payment}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        payment: event.target.value,
                      }))
                    }
                  >
                    {PAYMENTS.map((payment) => (
                      <option key={payment}>{payment}</option>
                    ))}
                  </select>
                </label>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" onClick={closeModal}>
                  Batal
                </button>
                <button className="primary-button" type="submit">
                  {editingId ? "Simpan Perubahan" : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
