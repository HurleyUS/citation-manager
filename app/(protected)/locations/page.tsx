"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function LocationsPage() {
  const createLocation = useMutation(api.locations.createLocation);
  const deleteLocation = useMutation(api.locations.deleteLocation);
  const locations = useQuery(api.locations.listLocations);

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const [name, setName] = useState("HustleLaunch");
  const [address, setAddress] = useState("146 Saints Place");
  const [phone, setPhone] = useState("828-593-1935");
  const [website, setWebsite] = useState("https://www.hustlelaunch.com");
  const [city, setCity] = useState("Canton");
  const [state, setState] = useState("NC");
  const [zipCode, setZipCode] = useState("28716");
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus("");

    try {
      await createLocation({
        businessName: name,
        address,
        phone,
        website,
        city,
        state,
        zipCode,
      });
      setSubmitStatus("✅ Location saved! Add another or submit to directories.");
      setName("");
      setAddress("");
      setPhone("");
      setWebsite("");
    } catch (err) {
      setSubmitStatus(`❌ Error: ${err instanceof Error ? err.message : "Failed to save"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId: Id<"locations">) => {
    if (!confirm("Are you sure you want to delete this location? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(locationId);
    setDeleteError("");

    try {
      await deleteLocation({ locationId });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete location");
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Citation Manager</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">📍 Add Business Location</h2>

          <form onSubmit={handleSaveLocation} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  maxLength={2}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code *</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  maxLength={5}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website (optional)
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {submitStatus && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  submitStatus.startsWith("✅")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {submitStatus}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition"
            >
              {loading ? "Saving..." : "Save Location"}
            </button>
          </form>
        </div>

        {/* Locations List */}
        {locations && locations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              📋 Your Locations ({locations.length})
            </h2>
            {deleteError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
                {deleteError}
              </div>
            )}
            <div className="space-y-4">
              {locations.map((loc: any) => (
                <div key={loc._id} className="border border-slate-200 rounded-lg p-4">
                  <div className="font-semibold text-slate-900">{loc.businessName}</div>
                  <div className="text-sm text-slate-600 mt-2">
                    {loc.address}, {loc.city}, {loc.state} {loc.zipCode}
                  </div>
                  <div className="text-sm text-slate-600">
                    {loc.phone} {loc.website && `• ${loc.website}`}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/submit?location=${loc._id}`}
                      className="flex-1 inline-block bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition text-center"
                    >
                      Submit to Directories →
                    </Link>
                    <Link
                      href={`/locations/${loc._id}/edit`}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteLocation(loc._id)}
                      disabled={deleteLoading === loc._id}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {deleteLoading === loc._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
