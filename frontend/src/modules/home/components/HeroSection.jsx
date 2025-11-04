import React from "react";

const HeroSection = () => {
  return (
    <section
      className="relative w-full h-[500px] bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://plus.unsplash.com/premium_photo-1673548917207-8747dffd1391?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687')",
      }}
    >
      <div className="absolute inset-0 bg-dark bg-opacity-40 "></div>
      <div className="hero-content max-w-7xl flex mx-auto justify-flex-start h-full items-center px-6">
      <div className="relative z-10 flex flex-col justify-end items-start h-full px-10 py-10 text-light max-w-2xl">
        <h1 className="font-italiana text-5xl mb-4 leading-tight">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam, sed..
        </h1>
        <p className="font-garamond text-lg mb-6 text-secondary2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci,
          dicta.
        </p>
        <button className="bg-primary1 px-6 py-2 rounded text-light hover:bg-primary2 transition font-garamond tracking-wide">
          Ver más
        </button>
      </div>
      </div>
    </section>
  );
};

export default HeroSection;
