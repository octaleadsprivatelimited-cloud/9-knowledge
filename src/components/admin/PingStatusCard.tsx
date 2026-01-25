import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export const PingStatusCard = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Backend Status
          </CardTitle>
          <CardDescription>Firebase services status</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <Badge variant="default" className="bg-green-500">
                Active
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Firebase services are always active
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Firebase services (Firestore, Storage, Authentication) stay active 24/7 without requiring keep-alive pings.
        </p>
      </CardContent>
    </Card>
  );
};

export default PingStatusCard;
