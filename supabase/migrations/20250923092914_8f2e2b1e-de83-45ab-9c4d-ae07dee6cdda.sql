-- Create phonepe_orders table for tracking PhonePe order lifecycle
CREATE TABLE public.phonepe_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    purchase_id UUID,
    merchant_order_id VARCHAR(63) NOT NULL UNIQUE,
    phonepe_order_id VARCHAR(255),
    amount NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    redirect_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_callbacks table for audit trail of PhonePe webhooks
CREATE TABLE public.payment_callbacks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    phonepe_order_id VARCHAR(255),
    merchant_order_id VARCHAR(63),
    callback_data JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT false,
    processing_error TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Add PhonePe-specific fields to purchases table
ALTER TABLE public.purchases 
ADD COLUMN phonepe_order_id VARCHAR(255),
ADD COLUMN merchant_order_id VARCHAR(63),
ADD COLUMN callback_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN phonepe_transaction_id VARCHAR(255);

-- Enable RLS on new tables
ALTER TABLE public.phonepe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_callbacks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for phonepe_orders
CREATE POLICY "Users can view their own PhonePe orders" 
ON public.phonepe_orders 
FOR SELECT 
USING (user_id IN (
    SELECT users.id
    FROM users
    WHERE users.clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'clerk_user_id'::text)
));

CREATE POLICY "Users can create their own PhonePe orders" 
ON public.phonepe_orders 
FOR INSERT 
WITH CHECK (user_id IN (
    SELECT users.id
    FROM users
    WHERE users.clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'clerk_user_id'::text)
));

CREATE POLICY "Users can update their own PhonePe orders" 
ON public.phonepe_orders 
FOR UPDATE 
USING (user_id IN (
    SELECT users.id
    FROM users
    WHERE users.clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'clerk_user_id'::text)
));

-- Create RLS policies for payment_callbacks (service role only for security)
CREATE POLICY "Service role can manage payment callbacks" 
ON public.payment_callbacks 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_phonepe_orders_user_id ON public.phonepe_orders(user_id);
CREATE INDEX idx_phonepe_orders_merchant_order_id ON public.phonepe_orders(merchant_order_id);
CREATE INDEX idx_phonepe_orders_status ON public.phonepe_orders(status);
CREATE INDEX idx_payment_callbacks_merchant_order_id ON public.payment_callbacks(merchant_order_id);
CREATE INDEX idx_payment_callbacks_processed ON public.payment_callbacks(processed);

-- Add constraints
ALTER TABLE public.phonepe_orders 
ADD CONSTRAINT chk_phonepe_orders_status 
CHECK (status IN ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'));

-- Create trigger for updated_at on phonepe_orders
CREATE TRIGGER update_phonepe_orders_updated_at
BEFORE UPDATE ON public.phonepe_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();