import { cookies,headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const cookieStore = await cookies();
  // const headersList = await headers();

  // const pathname = headersList.get('x-pathname');
  // const admin = cookieStore.get('admin');
  
  // if (!admin && pathname !== "/admin/login" ) {
  //   redirect('/admin/login');
  // }

  return (
    <div>
      {children}
    </div>
  );
}