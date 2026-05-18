import React, { useState, useEffect } from "react";
import {
  Trash2,
  Search,
  UserPlus,
  Briefcase,
  MapPin,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface Assignment {
  id: string;
  userId: string;
  role: string;
  unitId?: string;
  positionId?: string;
  workspaceId?: string;
  isActive: boolean;
  createdAt: string;
}

interface UserIdentity {
  id: string;
  username: string;
  role: string;
}

interface OrgUnit {
  id: string;
  name: string;
}

interface OrgPosition {
  id: string;
  name: string;
}

const AssignmentManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<UserIdentity[]>([]);
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [positions, setPositions] = useState<OrgPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // New Assignment Form
  const [newAssignment, setNewAssignment] = useState({
    userId: "",
    role: "Member",
    unitId: "",
    positionId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assRes, userRes, orgRes] = await Promise.all([
        fetch("/api/v1/identity/admin/assignments"),
        fetch("/api/v1/identity/admin/users"),
        fetch("/api/v1/identity/org-structure"),
      ]);

      const assData = await assRes.json();
      const userData = await userRes.json();
      const orgData = await orgRes.json();

      setAssignments(assData.assignments || []);
      setUsers(userData.users || []);
      setUnits(orgData.units || []);
      setPositions(orgData.positions || []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newAssignment.userId) return;

    try {
      const res = await fetch("/api/v1/identity/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssignment),
      });

      if (res.ok) {
        setIsAdding(false);
        setNewAssignment({
          userId: "",
          role: "Member",
          unitId: "",
          positionId: "",
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create assignment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const res = await fetch(`/api/v1/identity/assignments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  const getUsername = (userId: string) => {
    return users.find((u) => u.id === userId)?.username || userId;
  };

  const getUnitName = (unitId?: string) => {
    return units.find((u) => u.id === unitId)?.name || "—";
  };

  const getPositionName = (posId?: string) => {
    return positions.find((p) => p.id === posId)?.name || "—";
  };

  const filteredAssignments = assignments.filter((a) => {
    const username = getUsername(a.userId).toLowerCase();
    const unit = getUnitName(a.unitId).toLowerCase();
    const pos = getPositionName(a.positionId).toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      username.includes(term) ||
      unit.includes(term) ||
      pos.includes(term) ||
      a.role.toLowerCase().includes(term)
    );
  });

  if (loading && assignments.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
          color: "var(--text-dim)",
        }}
      >
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-dim)",
            }}
          />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 10px 10px 40px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              color: "var(--text-main)",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {isAdding ? <X size={16} /> : <UserPlus size={16} />}
          {isAdding ? "Cancel" : "Add Assignment"}
        </button>
      </div>

      {isAdding && (
        <div
          style={{
            padding: "24px",
            background: "rgba(122, 162, 247, 0.05)",
            borderRadius: "16px",
            border: "1px solid var(--primary)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: "15px",
            alignItems: "end",
            animation: "slideDown 0.3s ease-out",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              USER
            </label>
            <select
              value={newAssignment.userId}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, userId: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-main)",
              }}
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              UNIT
            </label>
            <select
              value={newAssignment.unitId}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, unitId: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-main)",
              }}
            >
              <option value="">Select Unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              POSITION
            </label>
            <select
              value={newAssignment.positionId}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  positionId: e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-main)",
              }}
            >
              <option value="">Select Position</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              ROLE
            </label>
            <select
              value={newAssignment.role}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, role: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-main)",
              }}
            >
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "var(--success)",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Check size={20} />
          </button>
        </div>
      )}

      <div
        style={{
          borderRadius: "16px",
          border: "1px solid var(--border)",
          overflow: "hidden",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr
              style={{
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th
                style={{
                  textAlign: "left",
                  padding: "15px 20px",
                  color: "var(--text-dim)",
                  fontWeight: 600,
                }}
              >
                User
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "15px 20px",
                  color: "var(--text-dim)",
                  fontWeight: 600,
                }}
              >
                Unit
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "15px 20px",
                  color: "var(--text-dim)",
                  fontWeight: 600,
                }}
              >
                Position
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "15px 20px",
                  color: "var(--text-dim)",
                  fontWeight: 600,
                }}
              >
                Role
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "15px 20px",
                  color: "var(--text-dim)",
                  fontWeight: 600,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map((a) => (
              <tr
                key={a.id}
                style={{
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.2s",
                }}
              >
                <td style={{ padding: "15px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      {getUsername(a.userId).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {getUsername(a.userId)}
                      </div>
                      <div
                        style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}
                      >
                        ID: {a.userId}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "15px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <MapPin size={14} style={{ color: "var(--primary)" }} />
                    {getUnitName(a.unitId)}
                  </div>
                </td>
                <td style={{ padding: "15px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Briefcase
                      size={14}
                      style={{ color: "var(--secondary)" }}
                    />
                    {getPositionName(a.positionId)}
                  </div>
                </td>
                <td style={{ padding: "15px 20px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background:
                        a.role === "Owner"
                          ? "rgba(187, 154, 247, 0.2)"
                          : "rgba(122, 162, 247, 0.1)",
                      color: a.role === "Owner" ? "#bb9af7" : "var(--primary)",
                      border: "1px solid",
                      borderColor:
                        a.role === "Owner"
                          ? "rgba(187, 154, 247, 0.3)"
                          : "rgba(122, 162, 247, 0.2)",
                    }}
                  >
                    {a.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "15px 20px", textAlign: "right" }}>
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--error)",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      transition: "background 0.2s",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAssignments.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--text-dim)",
                  }}
                >
                  No assignments found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AssignmentManager;
