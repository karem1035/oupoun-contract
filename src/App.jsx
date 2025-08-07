import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, CheckCircle, XCircle } from 'lucide-react';

const ContractComponent = () => {
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const {
    register: registerSign,
    handleSubmit: handleSignSubmit,
    formState: { errors: signErrors },
  } = useForm();

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'https://oupoun-test-272677622251.me-central1.run.app/api/v2';

  // GET contract data
  const fetchContract = async (data) => {
    setLoading(true);
    setError(null);
    setContractData(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/portal/contract/${data.ref}`
      );
      setContractData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في جلب العقد');
    } finally {
      setLoading(false);
    }
  };

  // POST sign contract
  const signContract = async (data) => {
    if (!contractData) return;

    setSigning(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(
        `${API_BASE_URL}/portal/contract/${contractData.ref}/sign?signature=${data.signature}`,
        ''
      );
      setSuccess('تم توقيع العقد بنجاح!');
      // Refresh contract data
      fetchContract({ ref: contractData.ref });
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في توقيع العقد');
    } finally {
      setSigning(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متاح';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 min-h-screen" dir="rtl">
      <h3 className="text-2xl font-bold text-center mt-10 md:mt-20">
        منصة العقود الرقمية
      </h3>
      {/* Contract Lookup Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <FileText className="w-5 h-5" />
            البحث عن عقد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(fetchContract)} className="space-y-4">
            <div>
              <Label htmlFor="ref">الرقم المرجعي للعقد</Label>
              <Input
                id="ref"
                {...register('ref', { required: 'الرقم المرجعي للعقد مطلوب' })}
                placeholder="أدخل الرقم المرجعي للعقد"
              />
              {errors.ref && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.ref.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {loading ? 'جاري التحميل...' : 'جلب العقد'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="text-right">
          <XCircle className="h-4 w-4 ml-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800 text-right">
          <CheckCircle className="h-4 w-4 ml-2" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Contract Data Display */}
      {contractData && (
        <div className="space-y-6">
          {/* Basic Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-right">
                تفاصيل العقد
                <div className="flex items-center gap-2">
                  {contractData.is_signed ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 ml-1" />
                      موقع
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-600 text-sm">
                      <XCircle className="w-4 h-4 ml-1" />
                      غير موقع
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    الرقم المرجعي
                  </Label>
                  <p className="text-lg font-mono">{contractData.ref}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    العمولة
                  </Label>
                  <p className="text-lg">
                    %{contractData.commission_percentage}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    تاريخ البدء
                  </Label>
                  <p>{formatDate(contractData.start_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    تاريخ الانتهاء
                  </Label>
                  <p>{formatDate(contractData.end_date)}</p>
                </div>
              </div>

              {contractData.business_details && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-right">
                  <h4 className="font-semibold mb-2">تفاصيل العمل</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm text-gray-600">
                        اسم العمل (EN)
                      </Label>
                      <p>{contractData.business_details.business_name?.en}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        اسم العمل (AR)
                      </Label>
                      <p>{contractData.business_details.business_name?.ar}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        رقم السجل التجاري
                      </Label>
                      <p>{contractData.business_details.cr_number}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Terms Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>شروط وتفاصيل العقد</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {/* Highlighted Terms */}
                {contractData.highlighted_terms &&
                  contractData.highlighted_terms.length > 0 && (
                    <AccordionItem value="highlighted-terms">
                      <AccordionTrigger className="text-right">
                        شروط هامة
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {contractData.highlighted_terms.map((term, index) => (
                            <div
                              key={index}
                              className="p-3 bg-yellow-50 border-r-4 border-yellow-400 rounded text-right"
                              dir="rtl"
                            >
                              <p className="font-medium text-yellow-800 mb-1">
                                {term.ar}
                              </p>
                              <p className="text-yellow-700 text-sm" dir="ltr">
                                {term.en}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                {/* Obligations */}
                {contractData.obligations &&
                  contractData.obligations.length > 0 && (
                    <AccordionItem value="obligations">
                      <AccordionTrigger className="text-right">
                        الالتزامات
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {contractData.obligations.map((obligation, index) => (
                            <div
                              key={index}
                              className="p-3 bg-blue-50 border-r-4 border-blue-400 rounded text-right"
                              dir="rtl"
                            >
                              <p className="font-medium text-blue-800 mb-1">
                                {obligation.ar}
                              </p>
                              <p className="text-blue-700 text-sm" dir="ltr">
                                {obligation.en}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                {/* Services */}
                {contractData.services && contractData.services.length > 0 && (
                  <AccordionItem value="services">
                    <AccordionTrigger className="text-right">
                      الخدمات
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {contractData.services.map((service, index) => (
                          <div
                            key={index}
                            className="p-3 bg-green-50 border-r-4 border-green-400 rounded text-right"
                            dir="rtl"
                          >
                            <p className="font-medium text-green-800 mb-1">
                              {service.ar}
                            </p>
                            <p className="text-green-700 text-sm" dir="ltr">
                              {service.en}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contract Signing */}
          {!contractData.is_signed && (
            <Card>
              <CardHeader>
                <CardTitle>توقيع العقد</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSignSubmit(signContract)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="signature">التوقيع الرقمي</Label>
                    <Input
                      id="signature"
                      {...registerSign('signature', {
                        required: 'التوقيع مطلوب',
                      })}
                      placeholder="أدخل توقيعك الرقمي"
                    />
                    {signErrors.signature && (
                      <p className="text-sm text-red-500 mt-1">
                        {signErrors.signature.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={signing}>
                    {signing && (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    )}
                    {signing ? 'جاري التوقيع...' : 'توقيع العقد'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractComponent;
