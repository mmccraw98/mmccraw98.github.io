# Mechanical Networks — series plan

*Linear algebra through mechanical networks, and back.*

(Planning notes only. The site doesn't publish this file.)

## Shared setup (used by every part)

- A network has $N$ nodes in $d$ dimensions, joined by $N_b$ springs with stiffnesses $K = \mathrm{diag}(k_b)$. It's built from a sphere/disk packing: contacts become bonds.
- Node displacements: $\mathbf{u} \in \mathbb{R}^{dN}$. Bond extensions: $\mathbf{e} \in \mathbb{R}^{N_b}$. Bond tensions: $\mathbf{t} \in \mathbb{R}^{N_b}$. Node forces: $\mathbf{f} \in \mathbb{R}^{dN}$.
- **Compatibility (rigidity) matrix** $C$ ($N_b \times dN$): $\mathbf{e} = C\mathbf{u}$. Row $b = (ij)$ is $\hat{\mathbf{n}}_{ij}\cdot(\mathbf{u}_j - \mathbf{u}_i)$.
- **Equilibrium matrix** $C^{\mathsf T}$: $\mathbf{f} = C^{\mathsf T}\mathbf{t}$. One matrix describes geometry (kinematics) and its transpose describes force balance (statics). This duality runs through the whole series.
- **Hooke's law** $\mathbf{t} = K\mathbf{e}$ gives the energy $E = \tfrac12 \mathbf{u}^{\mathsf T} C^{\mathsf T} K C\, \mathbf{u}$. So the stiffness matrix is $H = C^{\mathsf T} K C$ (for an unstressed network).

---

## Part I: Rigidity and the four fundamental subspaces

**Linear algebra:** rank, null spaces, the rank–nullity theorem, Strang's four fundamental subspaces.

Every subspace of $C$ is a physical object:

| Subspace | Physics |
|---|---|
| $\ker C$ | **zero modes**: displacements that stretch no bond (rigid-body motions + floppy modes) |
| $\ker C^{\mathsf T}$ | **states of self-stress**: tensions that balance at every node with no external load |
| $\mathrm{im}\, C$ | **compatible** extension patterns, i.e. ones some displacement can produce |
| $\mathrm{im}\, C^{\mathsf T}$ | **loadable** force patterns, i.e. ones the network can resist |

Rank–nullity applied to both $C$ and $C^{\mathsf T}$ gives the **Maxwell–Calladine index theorem**:
$N_0 - N_s = dN - N_b$. That leads to the isostatic point $z = 2d$, which is exactly where jammed packings sit. The punchline is that Maxwell constraint counting *is* rank–nullity.

Figures: draw a network and highlight its floppy modes (arrows) and self-stresses (bond thickness). Add or remove a bond and watch $N_0$ or $N_s$ change by one.

---

## Part II: The dynamical matrix and normal modes

**Linear algebra:** symmetric positive semi-definite matrices, the spectral theorem, generalized eigenproblems.

- $H = C^{\mathsf T} K C$ is symmetric PSD *because* it's built as "transpose times a positive matrix times the matrix". That's the algebraic reason a spring network can't have negative stiffness unless it's prestressed.
- With masses $M$, the dynamical matrix is $D = M^{-1/2} H M^{-1/2}$. Its eigenvectors are the normal modes and its eigenvalues are the squared frequencies $\omega^2$.
- Physics this unlocks: the density of states, soft modes and their excess near jamming, mode localization (participation ratio), and zero modes as the $\omega = 0$ eigenspace from Part I.

Figures: a mode viewer where you pick an eigenvalue from the spectrum and the network animates that mode, plus a density-of-states plot that changes as you add or remove bonds.

---

## Part III: The SVD — pairing strains with stresses

**Linear algebra:** the singular value decomposition, and why it's more than "eigen-decomposition for rectangular matrices".

Take the SVD of the (stiffness-weighted) compatibility matrix:
$$K^{1/2} C = U \Sigma V^{\mathsf T}, \qquad K^{1/2}C\,\mathbf{v}_i = \sigma_i \mathbf{u}_i, \qquad C^{\mathsf T}K^{1/2}\,\mathbf{u}_i = \sigma_i \mathbf{v}_i .$$

The physics of each singular triplet $(\sigma_i, \mathbf{v}_i, \mathbf{u}_i)$:

- **$\mathbf{v}_i$ is a displacement pattern and $\mathbf{u}_i$ is a bond pattern.** The two equations above are the kinematic and static descriptions of the *same* channel. Moving the nodes along $\mathbf{v}_i$ stretches the bonds only in pattern $\mathbf{u}_i$. Loading the bonds with tensions $\mathbf{u}_i$ pushes the nodes only along $\mathbf{v}_i$. So the SVD splits the network into **independent strain–stress channels** that don't talk to each other.
- **$\sigma_i$ is the stiffness of that channel**, a "gearing ratio" between how far the nodes move and how hard the bonds pull. $\sigma_i^2$ are the eigenvalues of $H$ from Part II. **So the vibrational spectrum is the squared singular values.**
- **Part II only saw half the picture.** The eigenvectors of $H$ are the $\mathbf{v}_i$ (node space). The SVD also gives the $\mathbf{u}_i$: what each vibrational mode looks like *in bond space*. The matrix $K^{1/2} C C^{\mathsf T} K^{1/2}$ acts on bonds and has the same nonzero spectrum. The same physics read on bonds instead of nodes is a less familiar but very useful view, for example for seeing which bonds carry the stress of a soft mode.
- **Zero singular values recover Part I.** Right singular vectors with $\sigma = 0$ span the zero modes, and left singular vectors with $\sigma = 0$ span the states of self-stress. Floppy modes and self-stresses turn out to be two sides of the same decomposition.
- **Low-rank truncation shows which channels matter.** Keeping the smallest-$\sigma$ channels gives the soft, large-response part of the network. That's the natural lead-in to Part IV.

This is how structural engineers analyze trusses (Pellegrino & Calladine's work on the equilibrium matrix). Physicists use it in the theory of isostatic and topological lattices (Kane & Lubensky; Lubensky et al., *Rep. Prog. Phys.* 2015). Both are worth checking for the write-up.

Figures: pick a singular value, then show $\mathbf{v}_i$ as arrows on the nodes and $\mathbf{u}_i$ as bond colors/thicknesses side by side. A slider moves through the spectrum from stiff to soft.

---

## Part IV: The pseudo-inverse — how a network responds

**Linear algebra:** solving singular or overdetermined systems, the Moore–Penrose pseudo-inverse, least squares, minimum-norm solutions.

The big theme is that **physics picks out which generalized inverse to use**.

1. **Displacement response to a load.** Solve $H\mathbf{u} = \mathbf{f}$, where $H$ is singular because of rigid-body motions and floppy modes.
   - A solution exists *only if $\mathbf{f}$ is loadable* ($\mathbf{f} \perp \ker H$, e.g. no net force or torque). That's Part I's $\mathrm{im}\, C^{\mathsf T}$ reappearing as a solvability condition.
   - The answer is fixed only up to free floppy motions. $\mathbf{u} = H^{+}\mathbf{f}$ is the response with those removed.
   - $H^{+} = \sum_i \sigma_i^{-2}\,\mathbf{v}_i\mathbf{v}_i^{\mathsf T}$ is the network's **Green's function**. The softest channels dominate, and as the network approaches isostaticity (jamming), $\sigma_{\min} \to 0$ and the response blows up. That's the linear-algebra version of diverging length scales near jamming.

2. **Bond tensions in an overconstrained network.** Solve $C^{\mathsf T}\mathbf{t} = \mathbf{f}$. If self-stresses exist, there are infinitely many solutions: add any state of self-stress and force balance still holds. This is *statically indeterminate*, and statics alone can't say which tensions are real.
   - Physics settles it: the actual tensions minimize the elastic (complementary) energy $\tfrac12\mathbf{t}^{\mathsf T}K^{-1}\mathbf{t}$ subject to force balance.
   - The result is $\mathbf{t} = K C H^{+}\mathbf{f}$, which is a **$K$-weighted pseudo-inverse**. For identical springs it's exactly the Moore–Penrose $(C^{\mathsf T})^{+}\mathbf{f}$, the minimum-norm solution.
   - So the "minimum norm" in the textbook definition of the pseudo-inverse is minimum energy in disguise, and the choice of norm is the choice of spring stiffnesses.

3. **Imposed strains and frustration.** Change some springs' rest lengths, imposing extensions $\mathbf{e}_0$. The network relaxes by minimizing $\tfrac12(C\mathbf{u}-\mathbf{e}_0)^{\mathsf T}K(C\mathbf{u}-\mathbf{e}_0)$. That's a **least-squares problem**, so energy minimization *is* least squares.
   - The part of $\mathbf{e}_0$ in $\mathrm{im}\,C$ relaxes away.
   - The part in $\ker C^{\mathsf T}$ (self-stress space) can't relax. It stays behind as **residual stress (prestress)**.
   - The least-squares residual *is* the frustration. This connects to tuning and allostery in networks, and to prestress in jammed packings.

4. **Elastic moduli (optional, but it ties to the Jamming project).** Under shear, the network first deforms affinely, then relaxes non-affinely: $\mathbf{u}_{na} = -H^{+}\boldsymbol{\Xi}\gamma$. The shear modulus is $G = G_{\text{affine}} - \boldsymbol{\Xi}^{\mathsf T}H^{+}\boldsymbol{\Xi}$ (Maloney & Lemaître 2006). The softening of jammed solids is a pseudo-inverse correction.

Figures: click or drag to apply a force at a node and watch $H^{+}\mathbf{f}$ spread through the network. Toggle a bond to make the network overconstrained and see the tension solution become non-unique. Change a rest length and watch residual stress appear.

---

## Possible Part V

Prestress and the full Hessian, $H = C^{\mathsf T}KC + (\text{stress term})$. Once the network is prestressed, the SVD of $C$ alone no longer gives $H$, which shows where the linear story ends and geometry takes over.
