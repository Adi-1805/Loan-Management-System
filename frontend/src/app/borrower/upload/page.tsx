'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { borrowerService } from '@/services/borrower.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(null);

  useEffect(() => {
    borrowerService
      .getProfile()
      .then((res) => {
        const p = res.data.data.profile;
        if (!p?.isBreApproved) {
          router.push('/borrower/profile');
          return;
        }
        if (p.salarySlipUrl) {
          setExistingUrl(p.salarySlipUrl);
        }
      })
      .catch(() => router.push('/borrower/profile'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, JPG, PNG allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }

    setUploading(true);
    try {
      await borrowerService.uploadSlip(file);
      toast.success('Salary slip uploaded');
      router.push('/borrower/apply');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">Salary Slip Upload</h2>
      <p className="text-gray-600 mb-6">Step 3: Upload PDF, JPG, or PNG (max 5 MB)</p>

      <Card>
        {existingUrl && (
          <p className="text-green-600 mb-4 text-sm">
            Existing file uploaded. You can upload a new one to replace it.
          </p>
        )}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
        />
        <div className="mt-6 flex gap-3">
          <Button onClick={handleUpload} loading={uploading} disabled={!file}>
            Upload
          </Button>
          {existingUrl && (
            <Button variant="outline" onClick={() => router.push('/borrower/apply')}>
              Continue to Apply
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
