export interface Shipment {
  id: string;
  sender: string;
  recipient: string;
  address: string;
  weight: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  role: 'staff' | 'admin' | 'client';
}