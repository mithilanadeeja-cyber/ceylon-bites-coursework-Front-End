import { useState, type FormEvent } from "react";
import { service, errorMessage } from "../services/api";
import { useApp } from "../context/AppContext";
import { useLoad, LoadState, money } from "../components/Shared";
import type { Food, Category } from "../types";
const blank: Food = {
  id: "",
  name: "",
  description: "",
  price: 0,
  categoryId: "",
  image: "photo-1512058564366-18510be2db19",
  vegetarian: false,
  available: true,
};
export default function Manage() {
  const load = useLoad(() =>
    Promise.all([service.foods(), service.categories()]),
  );
  const { notify } = useApp();
  const [food, setFood] = useState<Food | null>(null),
    [cat, setCat] = useState<Category | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (food)
        await service.saveFood(
          {
            ...food,
            id: food.id || crypto.randomUUID(),
            name: food.name.trim(),
          },
          !!food.id,
        );
      if (cat)
        await service.saveCategory(
          { ...cat, id: cat.id || crypto.randomUUID(), name: cat.name.trim() },
          !!cat.id,
        );
      setFood(null);
      setCat(null);
      load.reload();
      notify("Changes saved");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(type: "food" | "category", id: string) {
    if (!window.confirm("Delete this " + type + "?")) return;
    try {
      if (type === "food") await service.deleteFood(id);
      else await service.deleteCategory(id);
      load.reload();
      notify("Deleted successfully");
    } catch (e) {
      notify(errorMessage(e));
    }
  }
  return (
    <section className="page-section">
      <span className="eyebrow muted">RESTAURANT WORKSPACE</span>
      <h1>Manage your menu</h1>
      <p>Keep your dishes and categories up to date.</p>
      <LoadState {...load} retry={load.reload} />
      {(food || cat) && (
        <div className="panel mb-4">
          <h2>
            {food?.id || cat?.id ? "Edit" : "Add"} {food ? "food" : "category"}
          </h2>
          <form onSubmit={save}>
            {error && <div className="alert alert-danger">{error}</div>}
            <label className="field">
              Name
              <input
                className="form-control"
                required
                minLength={2}
                maxLength={80}
                value={food?.name ?? cat?.name ?? ""}
                onChange={(e) =>
                  food
                    ? setFood({ ...food, name: e.target.value })
                    : setCat({ ...cat!, name: e.target.value })
                }
              />
            </label>
            {food && (
              <>
                <label className="field">
                  Description
                  <textarea
                    className="form-control"
                    required
                    maxLength={200}
                    value={food.description}
                    onChange={(e) =>
                      setFood({ ...food, description: e.target.value })
                    }
                  />
                </label>
                <div className="row">
                  <label className="field col-md-6">
                    Price (LKR)
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      max="100000"
                      step="0.01"
                      required
                      value={food.price}
                      onChange={(e) =>
                        setFood({ ...food, price: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="field col-md-6">
                    Category
                    <select
                      className="form-select"
                      required
                      value={food.categoryId}
                      onChange={(e) =>
                        setFood({ ...food, categoryId: e.target.value })
                      }
                    >
                      <option value="">Select a category</option>
                      {load.data?.[1].map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="field">
                  Image URL or Unsplash photo ID
                  <input
                    className="form-control"
                    required
                    value={food.image}
                    onChange={(e) =>
                      setFood({ ...food, image: e.target.value })
                    }
                  />
                </label>
                <label className="me-4 mb-4">
                  <input
                    type="checkbox"
                    checked={food.vegetarian}
                    onChange={(e) =>
                      setFood({ ...food, vegetarian: e.target.checked })
                    }
                  />{" "}
                  Vegetarian
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={food.available}
                    onChange={(e) =>
                      setFood({ ...food, available: e.target.checked })
                    }
                  />{" "}
                  Available
                </label>
              </>
            )}
            <div>
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Saving…" : "Save changes"}
              </button>{" "}
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setFood(null);
                  setCat(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {load.data && !load.error && (
        <>
          <div className="section-heading">
            <h2>Food menu</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setFood({ ...blank });
                setCat(null);
                setError("");
              }}
            >
              + Add food
            </button>
          </div>
          <div className="table-responsive panel">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {load.data[0].map((f) => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td>
                      {load.data?.[1].find((c) => c.id === f.categoryId)?.name}
                    </td>
                    <td>{money(f.price)}</td>
                    <td>{f.available ? "Available" : "Unavailable"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          setFood({ ...f });
                          setCat(null);
                          setError("");
                          window.scrollTo(0, 0);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => remove("food", f.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="section-heading mt-5">
            <h2>Categories</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setCat({ id: "", name: "" });
                setFood(null);
                setError("");
                window.scrollTo(0, 0);
              }}
            >
              + Add category
            </button>
          </div>
          <div className="panel">
            {load.data[1].map((c) => (
              <div className="receipt-row" key={c.id}>
                <strong>{c.name}</strong>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => {
                      setCat({ ...c });
                      setFood(null);
                      setError("");
                      window.scrollTo(0, 0);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => remove("category", c.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
