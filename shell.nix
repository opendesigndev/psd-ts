{ pkgs ? import <nixpkgs> { } }:

with pkgs;

mkShell {
  buildInputs = [
    rustup
    wasm-pack
    nodejs-18_x
    # needed for node-canvas
    pkg-config
    pixman
    cairo
    pango
    # needed for color converter
    emscripten
    bloaty
    # testing JS
    nodePackages.http-server
    nodePackages.prettier
    nodePackages.indium

    nodePackages.typescript-language-server
  ];
}
