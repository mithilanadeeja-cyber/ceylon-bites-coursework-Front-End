import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  Plus,
  Clock,
  Leaf,
  Star,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { service } from "../services/api";
import { useApp } from "../context/AppContext";
import {
  useLoad,
  LoadState,
  photo,
  money,
  Quantity,
} from "../components/Shared";
export default function Menu() {
  const { cart, change, notify } = useApp();
  const load = useLoad(() =>
    Promise.all([service.foods(), service.categories()]),
  );
  const [category, setCategory] = useState("all"),
    [search, setSearch] = useState(""),
    [veg, setVeg] = useState(false),
    [sort, setSort] = useState("popular");
  const foods = (load.data?.[0] ?? [])
    .filter(
      (f) =>
        f.available &&
        (category === "all" || f.categoryId === category) &&
        (!veg || f.vegetarian) &&
        f.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    );
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="dot" /> FRESH FROM OUR KITCHEN
          </span>
          <h1>
            Good food.
            <br />
            Great mood.
          </h1>
          <p>
            Your favourite island flavours, made with love.
            <br className="desktop" /> A little comfort, delivered to your
            doorstep.
          </p>
          <a
            className="btn btn-light"
            href="#menu"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("menu")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Find your favourite <ArrowUpRight size={18} />
          </a>
          <div className="hero-meta">
            <span>
              <Clock size={16} /> 30–45 min delivery
            </span>
            <span>
              <Leaf size={16} /> Freshly prepared
            </span>
          </div>
        </div>
        <div className="hero-image">
          <img
            src={photo("photo-1512058564366-18510be2db19")}
            alt="A freshly prepared bowl of rice"
          />
          <div className="image-note">
            <Star size={17} fill="#eeb852" stroke="#eeb852" />
            <div>
              <strong>A little taste of home</strong>
              <small>Big flavours. Fresh ingredients.</small>
            </div>
          </div>
          <span className="round-label">
            MADE WITH
            <br />
            <b>love.</b>
          </span>
        </div>
      </section>
      <section id="menu" className="menu-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow muted">SOMETHING FOR EVERY CRAVING</span>
            <h2>What sounds good?</h2>
          </div>
          <label className="search">
            <Search size={19} />
            <input
              aria-label="Search food"
              placeholder="Search your favourites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <div className="filter-row">
          <div className="chips">
            {[{ id: "all", name: "All dishes" }, ...(load.data?.[1] ?? [])].map(
              (c) => (
                <button
                  key={c.id}
                  className={"chip " + (category === c.id ? "selected" : "")}
                  onClick={() => setCategory(c.id)}
                >
                  {c.name}
                </button>
              ),
            )}
          </div>
          <label className="veg-filter">
            <input
              type="checkbox"
              checked={veg}
              onChange={(e) => setVeg(e.target.checked)}
            />
            <Leaf size={15} /> Veg only
          </label>
        </div>
        <div className="results-bar">
          <span>{foods.length} delicious reasons to stay in</span>
          <label>
            Sort by:{" "}
            <select
              aria-label="Sort foods"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Our favourites</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
        <LoadState {...load} retry={load.reload} />
        <div className="food-grid">
          {!load.loading &&
            !load.error &&
            foods.map((f) => {
              const item = cart.find((i) => i.food.id === f.id);
              return (
                <article className="food-card" key={f.id}>
                  <div className="food-image">
                    <img src={photo(f.image)} alt={f.name} loading="lazy" />
                    {f.vegetarian ? (
                      <span className="food-tag">
                        <Leaf size={12} /> Vegetarian
                      </span>
                    ) : f.id === "1" ? (
                      <span className="food-tag">Kitchen favourite</span>
                    ) : null}
                  </div>
                  <div className="food-body">
                    <h3>{f.name}</h3>
                    <p>{f.description}</p>
                    <div className="food-bottom">
                      <strong>{money(f.price)}</strong>
                      {item ? (
                        <Quantity
                          value={item.quantity}
                          onChange={(d) => change(f, d)}
                        />
                      ) : (
                        <button
                          className="add-button"
                          aria-label={"Add " + f.name + " to cart"}
                          onClick={() => {
                            void change(f, 1);
                          }}
                        >
                          <Plus size={18} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
        {!load.loading && !load.error && !foods.length && (
          <div className="empty">
            <h3>No dishes found</h3>
            <p>Try another category or search.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setVeg(false);
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
      <section className="bottom-banner">
        <div>
          <Leaf size={28} />
          <div>
            <h3>Made fresh. Made for you.</h3>
            <p>Good ingredients and a whole lot of heart, in every order.</p>
          </div>
        </div>
        <Link to="/cart">
          Your next good meal <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
