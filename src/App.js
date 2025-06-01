import React, { useState } from "react";

const colors = {
  plumberBlue: "#005f73",
  plumberAccent: "#0a9396",
  plumberBackground: "#e0f7fa",
};

export default function PlumbingInvoiceApp() {
  const [view, setView] = useState("jobs"); // "jobs", "invoices", "receivedInvoices", "customers", "inventory"
  const [customers, setCustomers] = useState([
    { id: 1, name: "John Smith" },
    { id: 2, name: "Alice Johnson" },
  ]);
  const [partsInventory, setPartsInventory] = useState([
    { id: 1, name: "Pipe Fitting", unitPrice: 5.0, quantityOnHand: 100 },
    { id: 2, name: "Valve", unitPrice: 12.0, quantityOnHand: 50 },
    { id: 3, name: "Seal", unitPrice: 2.5, quantityOnHand: 200 },
  ]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  // Job templates for plumbing jobs
  const jobTemplates = [
    { id: 1, name: "Toilet repair", basePrice: 100 },
    { id: 2, name: "Leak fix", basePrice: 80 },
    { id: 3, name: "Pipe replacement", basePrice: 150 },
  ];

  // Toggle invoice paid/unpaid
  const toggleInvoicePaid = (invoiceId) => {
    setInvoices((old) =>
      old.map((inv) =>
        inv.id === invoiceId ? { ...inv, paid: !inv.paid } : inv
      )
    );
  };

  // Show and close invoice detail modal
  const showInvoiceDetails = (inv) => setInvoiceDetail(inv);
  const closeInvoiceDetails = () => setInvoiceDetail(null);

  // Job form state
  const [jobForm, setJobForm] = useState({
    customerId: "",
    templateId: "",
    partsUsed: [], // {partId, name, quantity, unitPrice}
  });

  // Add part to job form partsUsed
  const addPartToJob = (partId) => {
    const part = partsInventory.find((p) => p.id === parseInt(partId));
    if (!part) return;
    const exists = jobForm.partsUsed.find((p) => p.partId === part.id);
    if (exists) {
      setJobForm((old) => ({
        ...old,
        partsUsed: old.partsUsed.map((p) =>
          p.partId === part.id ? { ...p, quantity: p.quantity + 1 } : p
        ),
      }));
    } else {
      setJobForm((old) => ({
        ...old,
        partsUsed: [
          ...old.partsUsed,
          {
            partId: part.id,
            name: part.name,
            quantity: 1,
            unitPrice: part.unitPrice,
          },
        ],
      }));
    }
  };

  // Update quantity for parts used in job form
  const updatePartQuantity = (partId, qty) => {
    if (qty < 1) qty = 1;
    setJobForm((old) => ({
      ...old,
      partsUsed: old.partsUsed.map((p) =>
        p.partId === partId ? { ...p, quantity: qty } : p
      ),
    }));
  };

  // Remove part from job form
  const removePartFromJob = (partId) => {
    setJobForm((old) => ({
      ...old,
      partsUsed: old.partsUsed.filter((p) => p.partId !== partId),
    }));
  };

  // Create job from form
  const createJob = (e) => {
    e.preventDefault();
    const customer = customers.find(
      (c) => c.id === parseInt(jobForm.customerId)
    );
    const template = jobTemplates.find(
      (t) => t.id === parseInt(jobForm.templateId)
    );
    if (!customer || !template) {
      alert("Please select customer and job template.");
      return;
    }
    const partsCost = jobForm.partsUsed.reduce(
      (acc, p) => acc + p.quantity * p.unitPrice,
      0
    );
    const jobPrice = template.basePrice;

    const newJob = {
      id: jobs.length + 1,
      customerId: customer.id,
      customerName: customer.name,
      description: template.name,
      jobPrice,
      partsUsed: jobForm.partsUsed,
      partsCost,
      totalPrice: jobPrice + partsCost,
      date: new Date().toLocaleDateString(),
      paid: false,
    };
    setJobs((old) => [...old, newJob]);
    setJobForm({ customerId: "", templateId: "", partsUsed: [] });
  };

  // Create invoice from job (add job as unpaid invoice)
  const createInvoiceFromJob = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const newInvoice = { ...job, id: invoices.length + 1 };
    setInvoices((old) => [...old, newInvoice]);
    setJobs((old) => old.filter((j) => j.id !== jobId));
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 20,
        backgroundColor: colors.plumberBackground,
        minHeight: "100vh",
      }}
    >
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ color: colors.plumberBlue }}>Plumbing Invoice Manager</h1>
        <nav style={{ marginBottom: 10 }}>
          {[
            "jobs",
            "invoices",
            "receivedInvoices",
            "customers",
            "inventory",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              style={{
                marginRight: 10,
                padding: "8px 16px",
                backgroundColor: view === tab ? colors.plumberAccent : "white",
                border: `1px solid ${colors.plumberBlue}`,
                color: view === tab ? "white" : colors.plumberBlue,
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              {tab === "jobs" && "Jobs"}
              {tab === "invoices" && "Invoices (Unpaid)"}
              {tab === "receivedInvoices" && "Received Invoices (Paid)"}
              {tab === "customers" && "Customers"}
              {tab === "inventory" && "Parts Inventory"}
            </button>
          ))}
        </nav>
      </header>

      {/* Jobs Tab */}
      {view === "jobs" && (
        <section>
          <h2 style={{ color: colors.plumberBlue }}>Add New Job</h2>
          <form onSubmit={createJob} style={{ marginBottom: 20 }}>
            <label>
              Customer:{" "}
              <select
                value={jobForm.customerId}
                onChange={(e) =>
                  setJobForm((old) => ({ ...old, customerId: e.target.value }))
                }
                required
                style={{ marginRight: 10 }}
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Job Template:{" "}
              <select
                value={jobForm.templateId}
                onChange={(e) =>
                  setJobForm((old) => ({ ...old, templateId: e.target.value }))
                }
                required
                style={{ marginRight: 10 }}
              >
                <option value="">Select job type</option>
                {jobTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (${t.basePrice})
                  </option>
                ))}
              </select>
            </label>

            <div style={{ marginTop: 10 }}>
              <label>
                Add Part Used:{" "}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addPartToJob(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  style={{ marginRight: 10 }}
                >
                  <option value="">Select part</option>
                  {partsInventory.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.unitPrice})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {jobForm.partsUsed.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <h4>Parts Used</h4>
                <ul>
                  {jobForm.partsUsed.map((p) => (
                    <li key={p.partId}>
                      {p.name} x{" "}
                      <input
                        type="number"
                        min={1}
                        value={p.quantity}
                        onChange={(e) =>
                          updatePartQuantity(p.partId, parseInt(e.target.value))
                        }
                        style={{ width: 50 }}
                      />{" "}
                      @ ${p.unitPrice} = $
                      {(p.quantity * p.unitPrice).toFixed(2)}{" "}
                      <button
                        type="button"
                        onClick={() => removePartFromJob(p.partId)}
                        style={{
                          marginLeft: 10,
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          padding: "2px 6px",
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: 10,
                backgroundColor: colors.plumberBlue,
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              Create Job
            </button>
          </form>

          <h2 style={{ color: colors.plumberBlue }}>Pending Jobs</h2>
          {jobs.length === 0 && <p>No pending jobs.</p>}
          <ul>
            {jobs.map((job) => (
              <li key={job.id} style={{ marginBottom: 10 }}>
                <strong>{job.description}</strong> for{" "}
                <em>{job.customerName}</em> - Total: $
                {job.totalPrice.toFixed(2)}
                <br />
                <button
                  onClick={() => createInvoiceFromJob(job.id)}
                  style={{
                    marginTop: 4,
                    backgroundColor: colors.plumberAccent,
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                >
                  Create Invoice
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Invoices Tab (Unpaid) */}
      {view === "invoices" && (
        <section>
          <h2 style={{ color: colors.plumberBlue }}>Invoices (Unpaid)</h2>
          {invoices.filter((inv) => !inv.paid).length === 0 && (
            <p>No unpaid invoices.</p>
          )}
          <ul>
            {invoices
              .filter((inv) => !inv.paid)
              .map((inv) => (
                <li key={inv.id} style={{ marginBottom: 10 }}>
                  <strong>{inv.description}</strong> for{" "}
                  <em>{inv.customerName}</em>
                  <br />
                  Total: ${inv.totalPrice.toFixed(2)} — Status:{" "}
                  <button
                    onClick={() => toggleInvoicePaid(inv.id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: 5,
                      cursor: "pointer",
                      marginLeft: 5,
                    }}
                  >
                    Mark as Paid
                  </button>
                  <br />
                  <button
                    onClick={() => showInvoiceDetails(inv)}
                    style={{
                      backgroundColor: colors.plumberAccent,
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 5,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    View Details
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* Received Invoices Tab (Paid) */}
      {view === "receivedInvoices" && (
        <section>
          <h2 style={{ color: colors.plumberBlue }}>
            Received Invoices (Paid)
          </h2>
          {invoices.filter((inv) => inv.paid).length === 0 && (
            <p>No received (paid) invoices.</p>
          )}
          <ul>
            {invoices
              .filter((inv) => inv.paid)
              .map((inv) => (
                <li key={inv.id} style={{ marginBottom: 10 }}>
                  <strong>{inv.description}</strong> for{" "}
                  <em>{inv.customerName}</em>
                  <br />
                  Total: ${inv.totalPrice.toFixed(2)}
                  <br />
                  <button
                    onClick={() => toggleInvoicePaid(inv.id)}
                    style={{
                      backgroundColor: colors.plumberBlue,
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: 5,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    Mark as Unpaid
                  </button>
                  <br />
                  <button
                    onClick={() => showInvoiceDetails(inv)}
                    style={{
                      backgroundColor: colors.plumberAccent,
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 5,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    View Details
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* Customers Tab */}
      {view === "customers" && (
        <section>
          <h2 style={{ color: colors.plumberBlue }}>Customers</h2>
          {customers.length === 0 && <p>No customers available.</p>}
          <ul>
            {customers.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Parts Inventory Tab with Add/Edit/Delete */}
      {view === "inventory" && (
        <section>
          <h2 style={{ color: colors.plumberBlue }}>Parts Inventory</h2>

          {/* Add New Part Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const name = form.partName.value.trim();
              const unitPrice = parseFloat(form.unitPrice.value);
              const quantityOnHand = parseInt(form.quantityOnHand.value);
              if (!name) return alert("Part name is required");
              if (isNaN(unitPrice) || unitPrice < 0)
                return alert("Unit price must be a positive number");
              if (isNaN(quantityOnHand) || quantityOnHand < 0)
                return alert("Quantity on hand must be a positive integer");
              if (
                partsInventory.some(
                  (p) => p.name.toLowerCase() === name.toLowerCase()
                )
              )
                return alert("Part with this name already exists");

              const newPart = {
                id:
                  partsInventory.length > 0
                    ? partsInventory[partsInventory.length - 1].id + 1
                    : 1,
                name,
                unitPrice,
                quantityOnHand,
              };
              setPartsInventory((old) => [...old, newPart]);
              form.reset();
            }}
            style={{ marginBottom: 20 }}
          >
            <input
              type="text"
              name="partName"
              placeholder="Part Name"
              style={{ padding: 6, width: 150, marginRight: 10 }}
              required
            />
            <input
              type="number"
              name="unitPrice"
              placeholder="Unit Price"
              step="0.01"
              min="0"
              style={{ padding: 6, width: 100, marginRight: 10 }}
              required
            />
            <input
              type="number"
              name="quantityOnHand"
              placeholder="Quantity On Hand"
              min="0"
              style={{ padding: 6, width: 130, marginRight: 10 }}
              required
            />
            <button
              type="submit"
              style={{
                backgroundColor: colors.plumberBlue,
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              Add Part
            </button>
          </form>

          {/* Parts List with Edit/Delete */}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {partsInventory.map((part) => (
              <PartItem
                key={part.id}
                part={part}
                onUpdate={(updatedPart) => {
                  setPartsInventory((old) =>
                    old.map((p) => (p.id === updatedPart.id ? updatedPart : p))
                  );
                }}
                onDelete={() => {
                  if (
                    window.confirm(
                      `Delete part "${part.name}"? This cannot be undone.`
                    )
                  ) {
                    setPartsInventory((old) =>
                      old.filter((p) => p.id !== part.id)
                    );
                  }
                }}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Invoice Detail Modal */}
      {invoiceDetail && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={closeInvoiceDetails}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              maxWidth: 400,
              width: "90%",
            }}
          >
            <h3>Invoice Details</h3>
            <p>
              <strong>Description:</strong> {invoiceDetail.description}
            </p>
            <p>
              <strong>Customer:</strong> {invoiceDetail.customerName}
            </p>
            <p>
              <strong>Date:</strong> {invoiceDetail.date}
            </p>
            <p>
              <strong>Job Price:</strong> ${invoiceDetail.jobPrice.toFixed(2)}
            </p>
            <p>
              <strong>Parts Cost:</strong> ${invoiceDetail.partsCost.toFixed(2)}
            </p>
            <p>
              <strong>Total Price:</strong> $
              {invoiceDetail.totalPrice.toFixed(2)}
            </p>
            <p>
              <strong>Status:</strong> {invoiceDetail.paid ? "Paid" : "Unpaid"}
            </p>
            <button
              onClick={closeInvoiceDetails}
              style={{
                backgroundColor: colors.plumberBlue,
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 5,
                cursor: "pointer",
                marginTop: 10,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PartItem({ part, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(part.name);
  const [editUnitPrice, setEditUnitPrice] = React.useState(part.unitPrice);
  const [editQty, setEditQty] = React.useState(part.quantityOnHand);

  const saveEdit = () => {
    if (!editName.trim()) return alert("Part name cannot be empty");
    if (editUnitPrice < 0 || isNaN(editUnitPrice))
      return alert("Unit price must be a positive number");
    if (editQty < 0 || isNaN(editQty))
      return alert("Quantity must be a positive integer");

    onUpdate({
      ...part,
      name: editName.trim(),
      unitPrice: parseFloat(editUnitPrice),
      quantityOnHand: parseInt(editQty),
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li
        style={{
          marginBottom: 10,
          border: `1px solid ${colors.plumberBlue}`,
          padding: 8,
          borderRadius: 5,
          backgroundColor: "#f0f9fa",
        }}
      >
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          style={{ width: 150, marginRight: 10, padding: 4 }}
        />
        <input
          type="number"
          value={editUnitPrice}
          step="0.01"
          min="0"
          onChange={(e) => setEditUnitPrice(e.target.value)}
          style={{ width: 100, marginRight: 10, padding: 4 }}
        />
        <input
          type="number"
          value={editQty}
          min="0"
          onChange={(e) => setEditQty(e.target.value)}
          style={{ width: 130, marginRight: 10, padding: 4 }}
        />
        <button
          onClick={saveEdit}
          style={{
            backgroundColor: colors.plumberBlue,
            color: "white",
            border: "none",
            borderRadius: 5,
            padding: "4px 8px",
            marginRight: 5,
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          style={{
            backgroundColor: "gray",
            color: "white",
            border: "none",
            borderRadius: 5,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li
      style={{
        marginBottom: 10,
        border: `1px solid ${colors.plumberBlue}`,
        padding: 8,
        borderRadius: 5,
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span>
        {part.name} - ${part.unitPrice.toFixed(2)} - Qty: {part.quantityOnHand}
      </span>
      <div>
        <button
          onClick={() => setIsEditing(true)}
          style={{
            backgroundColor: colors.plumberAccent,
            color: "white",
            border: "none",
            borderRadius: 5,
            padding: "4px 8px",
            marginRight: 5,
            cursor: "pointer",
          }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: 5,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
