"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, User, Cloud, Globe, Quote, Loader2, CheckCircle2 } from "lucide-react";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { CityCombobox } from "@/components/ui/city-combobox";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    weatherCity: "Tehran",
    newsCountry: "us",
    quoteCategory: "motivational",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          weatherCity: data.settings?.weatherCity || "Tehran",
          newsCountry: data.settings?.newsCountry || "us",
          quoteCategory: data.settings?.quoteCategory || "motivational",
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      // Force session update to reflect new name in header
      await update({ name: formData.name });
      router.refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile and customize your dashboard widgets.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={session?.user?.email || ""} disabled className="bg-gray-50 dark:bg-gray-900" />
                <p className="text-xs text-gray-400">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Widget Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                Widget Preferences
              </CardTitle>
              <CardDescription>Customize the data shown on your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weather City */}
              <div className="space-y-2">
                <Label htmlFor="weather" className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" /> Weather City
                </Label>
                <CityCombobox
                  value={formData.weatherCity}
                  onChange={(val) => setFormData({ ...formData, weatherCity: val })}
                />
              </div>

              {/* News Country */}
              <div className="space-y-2">
                <Label htmlFor="news" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> News Country
                </Label>
                <CountryCombobox
                  value={formData.newsCountry}
                  onChange={(val) => setFormData({ ...formData, newsCountry: val })}
                />
              </div>

              {/* Quote Category */}
              <div className="space-y-2">
                <Label htmlFor="quote" className="flex items-center gap-2">
                  <Quote className="w-4 h-4" /> Quote Genre
                </Label>
                <Select
                  value={formData.quoteCategory}
                  onValueChange={(val) => setFormData({ ...formData, quoteCategory: val || "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="wisdom">Wisdom</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="life">Life</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-end items-center gap-4 border-t border-gray-200 dark:border-gray-800 pt-6"
      >
        {saved && (
          <span className="text-emerald-500 text-sm flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
          </span>
        )}
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </motion.div>
    </div>
  );
}
