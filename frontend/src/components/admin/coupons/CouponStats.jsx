import React from "react";
import {
  TicketPercent,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export default function CouponStats({ coupons = [] }) {
  const now = new Date();

  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter((coupon) => {
    const expired =
      coupon.expiresAt &&
      new Date(coupon.expiresAt) < now;

    const upcoming =
      coupon.startsAt &&
      new Date(coupon.startsAt) > now;

    return coupon.isActive !== false && !expired && !upcoming;
  }).length;

  const upcomingCoupons = coupons.filter((coupon) => {
    return (
      coupon.startsAt &&
      new Date(coupon.startsAt) > now
    );
  }).length;

  const expiredCoupons = coupons.filter((coupon) => {
    return (
      coupon.expiresAt &&
      new Date(coupon.expiresAt) < now
    );
  }).length;

  const stats = [
    {
      title: "Total Coupons",
      value: totalCoupons,
      icon: TicketPercent,
      description: "All coupons",
    },
    {
      title: "Active Coupons",
      value: activeCoupons,
      icon: CheckCircle,
      description: "Currently active",
    },
    {
      title: "Upcoming",
      value: upcomingCoupons,
      icon: Clock,
      description: "Starting soon",
    },
    {
      title: "Expired",
      value: expiredCoupons,
      icon: XCircle,
      description: "No longer valid",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 p-3">
                <Icon className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}