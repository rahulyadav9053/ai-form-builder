'use client';

import React, { useEffect, useState } from 'react';
import { useParams  } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { getSubmissionsByFormId } from '@/app/actions'; // Adjust the import path

interface DataInputProps {
  onDataSubmit: (data: any) => void;
}

const DataInput: React.FC<DataInputProps> = ({ onDataSubmit }) => {
  const params  = useParams();
  const formId = params.formId as string;//searchParams.get('formId');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [jsonData, setJsonData] = useState<any>(null);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!formId) {
        setError('formId is missing in the URL');
        setLoading(false);
        return;
      }

      const result = await getSubmissionsByFormId(formId);

      if ('error' in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const submissions = result.submissions;//.map(sub => sub.data); // adjust this line if your structure is different
      setJsonData(submissions);
      setLoading(false);
      setError('');

      if (submissions.length > 0) {
        onDataSubmit(submissions);
      } else {
        setError('No submissions found for this formId.');
      }
    };

    fetchFormData();
  }, [formId, onDataSubmit]);

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-card animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
        Fetching Form Submissions
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Form ID: <span className="font-mono text-primary-600">{formId || 'N/A'}</span>
      </p>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading data...</p>}

      {error && (
        <div className="mt-4 text-error-600 dark:text-error-400 flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!loading && jsonData && (
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-auto max-h-96 text-gray-800 dark:text-white">
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DataInput;
