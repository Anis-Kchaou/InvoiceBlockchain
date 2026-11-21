import { useEffect, useState } from "react";

const API = "http://localhost:3003";
const headers = { "Content-Type": "application/json" };

export default function Crud({ resource, fields, onCreate }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);

  const load = () =>
    fetch(`${API}/${resource}`).then((r) => r.json()).then(setRows);

  useEffect(() => {
    setForm({});
    setEditId(null);
    load();
  }, [resource]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const url = editId ? `${API}/${resource}/${editId}` : `${API}/${resource}`;
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers,
      body: JSON.stringify(form),
    });
    const saved = await res.json();

    if (!editId && onCreate) {
      try {
        const txHash = await onCreate(saved);
        await fetch(`${API}/${resource}/${saved.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ txHash }),
        });
      } catch (err) {
        alert("Blockchain : " + err.message);
      }
    }
    setForm({});
    setEditId(null);
    load();
  };

  const remove = async (id) => {
    await fetch(`${API}/${resource}/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h2>Liste des {resource}</h2>
      <form onSubmit={save} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {fields.map((f) => (
          <input
            key={f.name}
            name={f.name}
            type={f.type || "text"}
            placeholder={f.name}
            value={form[f.name] ?? ""}
            onChange={onChange}
            required
          />
        ))}
        <button>{editId ? "Modifier" : "Ajouter"}</button>
      </form>

      <table border="1" cellPadding="6" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>ID</th>
            {fields.map((f) => <th key={f.name}>{f.name}</th>)}
            {resource === "factures" && <th>Tx blockchain</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              {fields.map((f) => <td key={f.name}>{r[f.name]}</td>)}
              {resource === "factures" && (
                <td>{r.txHash ? r.txHash.slice(0, 12) + "…" : "—"}</td>
              )}
              <td>
                <button onClick={() => { setForm(r); setEditId(r.id); }}>Edit</button>
                <button onClick={() => remove(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}