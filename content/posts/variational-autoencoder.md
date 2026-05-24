+++
title = 'Variational Autoencoder and the Reparameterization Trick'
date = 2026-05-23T00:25:00+07:00
draft = false
tags = ["TIL"]
math = true
+++

{{< admonition type="tip" title="New Tag!" >}}
This will mark the beginning of a new series of posts: **Today I Learned (TIL)**, where I will share the things I have just figured out hours ago (mostly about machine learning). Also this will serve as a personal note for me to refer back to when I forget something, which is very likely to happen.
{{< /admonition >}}

# What is Variational Autoencoder (VAE)?

![vae](/vae/VAE_Basic.png)

**Variational Autoencoder** is a generative model that learns to encode data into a latent space. Unlike traditional autoencoders that compress an image into a single fixed point, a VAE compresses data into a probability distribution. This allows it to generate brand-new data by sampling from that distribution. It consists of two main components:
- An **Encoder** that maps input data to a latent representation.
- A **Decoder** that reconstructs the data from the latent representation.

**Why probabilistic latent space?**

Standard autoencoders are like dictionaries, if you feed it a picture of a cat, it squishes down into a single ID number (e.g. `Box 402`). If you ask the decoder to read `Box 402.5`, it will freak out and give you nonsense because it only knows exact boxes.

In contrast, VAE is more like a blurry circle maker, instead of a fixed box, the encoder circles a bunch of adjacent cat pictures. It gives decoder a center point and an allowed fuzziness radius (variance). So if you ask the decoder to read `Circle 402.5`, it can still give you a decent cat picture because it knows that nearby points in the latent space also correspond to cats.

These probabilities are represented by a mean vector $\mu$ and a variance vector $\sigma^2$. The mean vector indicates the center of the circle, while the variance vector indicates how much the points can spread out from the center. This allows VAE to generate new data points that are similar to the training data, by sampling from the latent space.

Here is a simple interactive visualization of Gaussian distribution in a 2D latent space:

{{< gaussian-viz >}}

{{< admonition type="info">}}
You can see that the higher the variance, the more spread out the curve is. This usually means that the model is less certain about the latent representation of the input data, which can lead to more diverse but potentially less accurate reconstructions.
{{< /admonition >}}

# The Loss Function

Training a VAE means maximizing the likelihood of our data, $\log p(x)$. Computing
this directly is intractable because it requires integrating over every possible latent $z$.
Instead, we derive and maximize a tractable lower bound called the
**Evidence Lower Bound (ELBO)**:

$$
\text{ELBO} = \mathbb{E}_{q(z|x)}[\log p(x|z)] - D_{KL}(q(z|x) \parallel p(z))
$$

Since gradient descent minimizes, we define the VAE loss as the negative ELBO:

$$
\mathcal{L} = -\mathbb{E}_{q(z|x)}[\log p(x|z)] + D_{KL}(q(z|x) \parallel p(z))
$$

Each term has a distinct role:

- **Reconstruction Loss** $-\mathbb{E}_{q(z|x)}[\log p(x|z)]$: penalizes the decoder
  for poor reconstructions. Forces the network to retain detail.

- **KL Divergence** $D_{KL}(q(z|x) \parallel p(z))$: penalizes the encoder for
  drifting from the standard normal prior $\mathcal{N}(0, I)$. Prevents the latent
  space from collapsing into isolated, disconnected clusters.

## The Tug-of-War

The two terms oppose each other. Without KL divergence, the encoder ignores the
Gaussian constraint entirely and behaves like a standard autoencoder. Without
reconstruction loss, the network cheats and every distribution collapses to
$\mathcal{N}(0, I)$ resulting in the gibberish outputs from the decoder.

Mathematically, the KL term for a single latent dimension is:

$$
D_{KL}(\mathcal{N}(\mu, \sigma^2) \| \mathcal{N}(0, 1))
= \frac{1}{2} \left( \sigma^2 + \mu^2 - 1 - \ln(\sigma^2) \right)
$$

This drives $\mu \to 0$ and $\sigma^2 \to 1$, while the $-\ln(\sigma^2)$ term
specifically prevents variance from collapsing to zero.

# The Reparameterization Trick

If you assemble the components built so far and attempt to train the network using standard gradient descent, the training loop will completely break down at the sampling bottleneck.

The bottleneck occurs during the sampling step: $z \sim q(z|x) = \mathcal{N}(\mu, \sigma^2)$. Sampling from a random distribution is a stochastic (non-deterministic) operation. Because it is non-deterministic, you cannot compute a partial derivative through a random sample. Gradients cannot flow backward from the decoder back to the encoder, making end-to-end backpropagation impossible.

![Reparameterization Trick](/vae/reparameterization_trick.png)

## Shifting the Stochastic Component

We bypass this structural limitation by isolating the randomness into an independent noise variable $\epsilon$. Instead of sampling directly from $\mathcal{N}(\mu, \sigma^2)$, we draw a sample $\epsilon$ from a fixed Standard Normal distribution $\mathcal{N}(0, I)$ and apply a linear transformation to shift and scale it:

$$
z = \mu + \sigma \odot \epsilon
$$

Where $\odot$ represents element-wise multiplication.

By restructuring the operation this way, the stochasticity is pushed entirely into an external input variable ($\epsilon$) that does not require gradients. The parameters requiring optimization ($\mu$ and $\sigma$) now sit outside the stochastic bottleneck, enabling stable, standard backpropagation through a completely deterministic path.

---

*Image source: EugenioTL - Own work, CC BY-SA 4.0, https://commons.wikimedia.org/w/index.php?curid=107231101*

*Original paper: [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114).*