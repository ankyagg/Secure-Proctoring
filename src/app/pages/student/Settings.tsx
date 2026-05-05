import { useState, useEffect } from "react";
import { useStudentContext } from "../../components/StudentLayout";
import { account, storage, APPWRITE_STORAGE_ID, databases, APPWRITE_DB_ID } from "../../services/appwrite";
import { User, Mail, Shield, Camera, Save, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { ID } from "appwrite";

export default function Settings() {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useStudentContext();
  const [name, setName] = useState(currentUser?.username || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || "");

  useEffect(() => {
    setName(currentUser?.username || "");
    setAvatarUrl(currentUser?.avatar || "");
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await account.updateName(name);
      // Update custom profile if needed in a database collection
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("Image is too large! Maximum limit is 5MB. Please compress your photo.");
      return;
    }

    setUploading(true);
    try {
      const result = await storage.createFile(APPWRITE_STORAGE_ID, ID.unique(), file);
      // Using getFileView for full resolution or getFilePreview for optimized
      const url = storage.getFilePreview(APPWRITE_STORAGE_ID, result.$id, 400, 400).toString();
      
      await account.updatePrefs({ avatar: url });
      if (refreshUser) await refreshUser();
      
      setAvatarUrl(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);
      alert(err.message || "Failed to upload image. Please try a different photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-[#0099ff]/30 pb-32">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#0099ff]/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-8 pt-10">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-[#525252] hover:text-white transition-all text-[10px] font-semibold uppercase tracking-wider group mb-10"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Go Back
        </motion.button>

        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight uppercase">
              Account <span className="text-[#0099ff]">Settings.</span>
            </h1>
            <p className="text-[#525252] text-sm font-semibold uppercase tracking-widest">
              Update your identity and profile information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Avatar Section */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-wider">Profile Picture</h3>
              <div className="relative group">
                <div className="w-full aspect-square rounded-[3rem] bg-[#090909] border border-white/5 flex items-center justify-center overflow-hidden relative shadow-2xl">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-[#2a2a2a]" />
                  )}
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                    <Camera className="w-8 h-8 text-white mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload New</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-xl">
                      <Loader2 className="w-8 h-8 text-[#0099ff] animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:col-span-2 space-y-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider ml-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a]" />
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-[#090909] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold text-white outline-none focus:border-[#0099ff]/50 transition-all shadow-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a]" />
                    <input 
                      value={currentUser?.email || ""}
                      readOnly
                      disabled
                      className="w-full bg-[#090909]/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold text-[#2a2a2a] outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider ml-2">System ID</label>
                  <div className="relative">
                    <Shield className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a2a2a]" />
                    <input 
                      value={currentUser?.id || ""}
                      readOnly
                      disabled
                      className="w-full bg-[#090909]/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold text-[#2a2a2a] outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <button
                  onClick={handleSave}
                  disabled={loading || uploading}
                  className="px-12 py-5 bg-[#0099ff] text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-black transition-all shadow-[0_20px_50px_-10px_rgba(0,153,255,0.4)] active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>

                <AnimatePresence>
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Updated Successfully
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
