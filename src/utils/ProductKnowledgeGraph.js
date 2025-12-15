// Product Knowledge Graph - Semantic relationships between products
export class ProductKnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.relationships = {
      COMPATIBLE_WITH: 'compatible_with',
      ALTERNATIVE_TO: 'alternative_to',
      REQUIRES: 'requires',
      USED_WITH: 'used_with',
      CATEGORY: 'category',
      MATERIAL: 'material',
      FINISH: 'finish',
      APPLICATION: 'application'
    };
  }
  
  // Add a product node to the graph
  addProduct(product) {
    const nodeId = product.id;
    this.nodes.set(nodeId, {
      id: nodeId,
      type: 'product',
      data: product,
      properties: {
        name: product.name,
        category: product.category,
        finish: product.finish,
        material: product.material || 'paint',
        vendor: product.vendor
      }
    });
    
    // Initialize edges for this node
    if (!this.edges.has(nodeId)) {
      this.edges.set(nodeId, []);
    }
  }
  
  // Add a relationship between two products
  addRelationship(fromProductId, toProductId, relationshipType, weight = 1.0) {
    const edge = {
      from: fromProductId,
      to: toProductId,
      type: relationshipType,
      weight: weight
    };
    
    if (!this.edges.has(fromProductId)) {
      this.edges.set(fromProductId, []);
    }
    
    this.edges.get(fromProductId).push(edge);
  }
  
  // Find products by category
  findByCategory(category) {
    const results = [];
    for (const [, node] of this.nodes) {
      if (node.properties.category?.toLowerCase() === category.toLowerCase()) {
        results.push(node.data);
      }
    }
    return results;
  }
  
  // Find products by finish
  findByFinish(finish) {
    const results = [];
    for (const [, node] of this.nodes) {
      if (node.properties.finish?.toLowerCase() === finish.toLowerCase()) {
        results.push(node.data);
      }
    }
    return results;
  }
  
  // Find compatible products
  findCompatibleProducts(productId) {
    const compatibleProducts = [];
    const edges = this.edges.get(productId) || [];
    
    edges.forEach(edge => {
      if (edge.type === this.relationships.COMPATIBLE_WITH || 
          edge.type === this.relationships.ALTERNATIVE_TO) {
        const product = this.nodes.get(edge.to);
        if (product) {
          compatibleProducts.push({
            product: product.data,
            relationshipType: edge.type,
            weight: edge.weight
          });
        }
      }
    });
    
    return compatibleProducts;
  }
  
  // Find products that require this product
  findDependentProducts(productId) {
    const dependents = [];
    
    for (const [nodeId, edges] of this.edges) {
      edges.forEach(edge => {
        if (edge.to === productId && edge.type === this.relationships.REQUIRES) {
          const product = this.nodes.get(nodeId);
          if (product) {
            dependents.push(product.data);
          }
        }
      });
    }
    
    return dependents;
  }
  
  // Semantic search - find products matching multiple criteria
  semanticSearch(criteria) {
    const results = [];
    
    for (const [, node] of this.nodes) {
      let score = 0;
      let matches = 0;
      
      // Category match
      if (criteria.category && node.properties.category?.toLowerCase() === criteria.category.toLowerCase()) {
        score += 30;
        matches++;
      }
      
      // Finish match
      if (criteria.finish && node.properties.finish?.toLowerCase() === criteria.finish.toLowerCase()) {
        score += 25;
        matches++;
      }
      
      // Material match
      if (criteria.material && node.properties.material?.toLowerCase() === criteria.material.toLowerCase()) {
        score += 20;
        matches++;
      }
      
      // Vendor match
      if (criteria.vendor && node.properties.vendor?.toLowerCase() === criteria.vendor.toLowerCase()) {
        score += 15;
        matches++;
      }
      
      // Coverage match
      if (criteria.minCoverage && node.data.coverage >= criteria.minCoverage) {
        score += 10;
        matches++;
      }
      
      if (matches > 0) {
        results.push({
          product: node.data,
          score: score,
          matchCount: matches
        });
      }
    }
    
    // Sort by score
    return results.sort((a, b) => b.score - a.score);
  }
  
  // Find shortest path between two products (for recommendations)
  findPath(fromProductId, toProductId, maxDepth = 3) {
    const visited = new Set();
    const queue = [[fromProductId]];
    
    while (queue.length > 0) {
      const path = queue.shift();
      const currentNode = path[path.length - 1];
      
      if (currentNode === toProductId) {
        return path.map(id => this.nodes.get(id)?.data);
      }
      
      if (path.length >= maxDepth) {
        continue;
      }
      
      if (visited.has(currentNode)) {
        continue;
      }
      
      visited.add(currentNode);
      
      const edges = this.edges.get(currentNode) || [];
      edges.forEach(edge => {
        if (!visited.has(edge.to)) {
          queue.push([...path, edge.to]);
        }
      });
    }
    
    return null; // No path found
  }
  
  // Get product recommendations based on current selection
  getRecommendations(productId, limit = 5) {
    const recommendations = [];
    const product = this.nodes.get(productId);
    
    if (!product) return recommendations;
    
    // Find compatible products
    const compatible = this.findCompatibleProducts(productId);
    recommendations.push(...compatible);
    
    // Find products in same category
    const sameCategory = this.findByCategory(product.properties.category);
    sameCategory.forEach(p => {
      if (p.id !== productId && !recommendations.some(r => r.product?.id === p.id)) {
        recommendations.push({
          product: p,
          relationshipType: 'same_category',
          weight: 0.7
        });
      }
    });
    
    // Sort by weight and limit
    return recommendations
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }
  
  // Analyze product clusters
  findClusters() {
    const clusters = new Map();
    
    for (const [, node] of this.nodes) {
      const category = node.properties.category || 'uncategorized';
      
      if (!clusters.has(category)) {
        clusters.set(category, []);
      }
      
      clusters.get(category).push(node.data);
    }
    
    return clusters;
  }
  
  // Get graph statistics
  getStatistics() {
    const stats = {
      totalProducts: this.nodes.size,
      totalRelationships: 0,
      categories: new Set(),
      vendors: new Set(),
      avgConnectionsPerProduct: 0
    };
    
    for (const [, node] of this.nodes) {
      if (node.properties.category) stats.categories.add(node.properties.category);
      if (node.properties.vendor) stats.vendors.add(node.properties.vendor);
    }
    
    for (const [, edges] of this.edges) {
      stats.totalRelationships += edges.length;
    }
    
    stats.avgConnectionsPerProduct = stats.totalRelationships / this.nodes.size || 0;
    
    return {
      ...stats,
      categories: Array.from(stats.categories),
      vendors: Array.from(stats.vendors)
    };
  }
  
  // Export graph for visualization
  exportGraph() {
    const nodes = [];
    const links = [];
    
    for (const [id, node] of this.nodes) {
      nodes.push({
        id: id,
        name: node.properties.name,
        category: node.properties.category,
        vendor: node.properties.vendor
      });
    }
    
    for (const [fromId, edges] of this.edges) {
      edges.forEach(edge => {
        links.push({
          source: fromId,
          target: edge.to,
          type: edge.type,
          weight: edge.weight
        });
      });
    }
    
    return { nodes, links };
  }
}

// Create and initialize knowledge graph
export const productKnowledgeGraph = new ProductKnowledgeGraph();

// Helper function to build graph from product repository
export function buildKnowledgeGraph(productRepository) {
  // Add all products as nodes
  Object.entries(productRepository).forEach(([vendorName, products]) => {
    products.forEach(product => {
      productKnowledgeGraph.addProduct({
        ...product,
        vendor: vendorName
      });
    });
  });
  
  // Add relationships based on properties
  const allProducts = [];
  Object.entries(productRepository).forEach(([vendorName, products]) => {
    products.forEach(product => {
      allProducts.push({ ...product, vendor: vendorName });
    });
  });
  
  // Create relationships
  allProducts.forEach((product1, i) => {
    allProducts.forEach((product2, j) => {
      if (i >= j) return; // Avoid duplicates and self-references
      
      // Same category = compatible
      if (product1.category === product2.category) {
        productKnowledgeGraph.addRelationship(
          product1.id,
          product2.id,
          productKnowledgeGraph.relationships.COMPATIBLE_WITH,
          0.8
        );
      }
      
      // Same finish = alternative
      if (product1.finish === product2.finish && product1.category === product2.category) {
        productKnowledgeGraph.addRelationship(
          product1.id,
          product2.id,
          productKnowledgeGraph.relationships.ALTERNATIVE_TO,
          0.9
        );
      }
      
      // Different categories but complementary
      if (product1.category === 'Exterior' && product2.category === 'Interior') {
        productKnowledgeGraph.addRelationship(
          product1.id,
          product2.id,
          productKnowledgeGraph.relationships.USED_WITH,
          0.6
        );
      }
    });
  });
  
  return productKnowledgeGraph;
}
