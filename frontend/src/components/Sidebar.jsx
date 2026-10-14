export default function Sidebar(){

return (

<>

<div className="
grid grid-cols-2 gap-4
bg-[#f6f7f7]
rounded-3xl overflow-hidden
">

<img
src="/premium.png"
/>


<div className="p-5">

<h2 className="text-xl font-bold">
Premium
<br/>
Design and
<br/>
Quality
</h2>

<p className="text-xs mt-3">
Born out of shared love of good design.
</p>


<button className="
bg-orange-500 text-white
px-4 py-2 rounded-lg mt-4 text-sm
">
Shop Now
</button>

</div>

</div>



<h2 className="text-2xl font-semibold">
Bestsellers
</h2>


<div className="
grid grid-cols-2 gap-4
">

<img src="/products/man.png"/>
<img src="/products/dress.png"/>
<img src="/products/shirt.png"/>
<img src="/products/yellow.png"/>

</div>



<div className="
bg-[#f6f7f7]
rounded-3xl p-6 text-center
">

<h3 className="font-bold">
Subscribe to our email newsletter
and get 10% off
</h3>


<input
placeholder="Email address"
className="
mt-5 px-4 py-2 rounded-lg
"
/>

<button className="
bg-orange-500 text-white
px-4 py-2 rounded-lg ml-2
">
Subscribe
</button>

</div>


</>

)

}