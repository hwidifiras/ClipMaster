import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  List,
  ListItem,
  Heading,
  Badge,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
  Code,
  Container,
  Divider,
  ScaleFade,
  Tooltip,
  Switch,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import { SearchIcon, StarIcon, DeleteIcon, CopyIcon, SettingsIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { detectCode } from './utils/codeDetection'
import { useClipboard } from './hooks/useClipboard'

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: Date;
  isFavorite: boolean;
  type: 'text' | 'code' | 'url';
  language?: string | null;
  confidence?: number;
}

interface ClipboardListProps {
  items: ClipboardItem[];
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectItem: (id: string) => void;
}

function App() {
  const [selectedText, setSelectedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Use our custom clipboard hook
  const {
    isElectron,
    isMonitoring,
    history: clipboardHistory,
    startMonitoring,
    stopMonitoring,
    getCurrentClipboard,
    setClipboard,
    addToHistory,
    setHistory: setClipboardHistory
  } = useClipboard();

  // Setup clipboard change listener
  useEffect(() => {
    if (!isElectron) return;

    const cleanup = (window as any).electronAPI?.onClipboardChange((content: string) => {
      console.log('Clipboard changed, adding to history:', content.substring(0, 50) + '...');
      addToHistory(content, detectCode);
      
      toast({
        title: "New clipboard content detected",
        description: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    });

    return cleanup;
  }, [isElectron, addToHistory, toast]);

  // Auto-start monitoring when app loads (if in Electron)
  useEffect(() => {
    if (isElectron && !isMonitoring) {
      startMonitoring();
    }
  }, [isElectron, isMonitoring, startMonitoring]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to add content
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (selectedText.trim()) {
          addToClipboard();
        }
      }
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape to clear search
      if (event.key === 'Escape') {
        setSearchQuery('');
        setSelectedItemId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedText]);

  const addToClipboard = useCallback(async () => {
    if (selectedText.trim()) {
      // Add to clipboard system
      const success = await setClipboard(selectedText);
      
      if (success) {
        // Add to our history
        addToHistory(selectedText, detectCode);
        setSelectedText('');
        
        toast({
          title: "Added to clipboard",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to add to clipboard",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  }, [selectedText, setClipboard, addToHistory, toast]);

  const copyToClipboard = async (content: string) => {
    const success = await setClipboard(content);
    
    if (success) {
      toast({
        title: "Copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed to copy",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const toggleFavorite = (id: string) => {
    setClipboardHistory(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const deleteItem = (id: string) => {
    setClipboardHistory(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const clearHistory = () => {
    setClipboardHistory([]);
    toast({
      title: "History cleared",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Handle clipboard monitoring toggle
  const toggleMonitoring = async () => {
    if (isMonitoring) {
      await stopMonitoring();
    } else {
      await startMonitoring();
    }
  };

  const filteredHistory = clipboardHistory.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItem = clipboardHistory.find(item => item.id === selectedItemId);

  return (
    <Box w="100vw" maxW="100vw" overflowX="hidden" minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" p={4}>
        <VStack spacing={4} align="stretch">
          {/* Enhanced Header with better spacing */}
          <Box w="100%" borderBottom="1px" borderColor={borderColor} pb={4}>
            <VStack spacing={4}>
              <HStack w="100%" justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                    ClipMaster
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    Smart Clipboard Manager
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  <Tooltip label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}>
                    <IconButton
                      aria-label="Toggle dark mode"
                      icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                      onClick={toggleColorMode}
                      variant="ghost"
                      size="md"
                      transition="all 0.2s"
                      _hover={{ transform: 'scale(1.05)' }}
                    />
                  </Tooltip>
                  <Tooltip label="Clear clipboard history">
                    <IconButton
                      aria-label="Clear history"
                      icon={<DeleteIcon />}
                      onClick={clearHistory}
                      variant="ghost"
                      size="md"
                      colorScheme="red"
                      transition="all 0.2s"
                      _hover={{ transform: 'scale(1.05)', color: 'red.500' }}
                    />
                  </Tooltip>
                  <Menu>
                    <Tooltip label="Settings">
                      <MenuButton
                        as={IconButton}
                        aria-label="Settings"
                        icon={<SettingsIcon />}
                        variant="ghost"
                        size="md"
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.05)' }}
                      />
                    </Tooltip>
                    <MenuList>
                      <MenuItem onClick={clearHistory} color="red.500">
                        Clear History
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              </HStack>
              
              {/* Clipboard monitoring status */}
              {isElectron && (
                <HStack w="100%" justify="space-between" align="center" p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
                  <HStack spacing={3}>
                    <Badge colorScheme={isMonitoring ? 'green' : 'gray'} variant="solid">
                      {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      Real-time clipboard detection
                    </Text>
                  </HStack>
                  <Switch
                    isChecked={isMonitoring}
                    onChange={toggleMonitoring}
                    colorScheme="green"
                    size="md"
                  />
                </HStack>
              )}

              {/* Browser fallback notice */}
              {!isElectron && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Browser Mode</AlertTitle>
                    <AlertDescription>
                      Running in browser mode. Automatic clipboard monitoring is not available. Use the manual input below.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </Box>

        <HStack w="100%" maxW="100%" mx="0" align="start" spacing={6}>
          {/* Left Section - Enhanced layout */}
          <Box flex={{ base: '1 1 100%', md: '2 0 0' }} minW="0" w="100%">
            <VStack w="full" spacing={5}>
              {/* Enhanced Search Bar */}
              <ScaleFade initialScale={0.9} in={true}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search your clipboard history... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="xl"
                    _focus={{ 
                      borderColor: "blue.400", 
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" 
                    }}
                    transition="all 0.2s"
                  />
                </InputGroup>
              </ScaleFade>

              {/* Enhanced Tab Container */}
              <Box 
                w="full" 
                borderWidth={1} 
                borderColor={borderColor} 
                borderRadius="xl" 
                p={6}
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: 'md' }}
              >
                <Tabs variant="soft-rounded" colorScheme="blue" size="md">
                  <TabList gap={2} mb={6}>
                    <Tab transition="all 0.2s" _hover={{ transform: 'translateY(-1px)' }}>All</Tab>
                    <Tab transition="all 0.2s" _hover={{ transform: 'translateY(-1px)' }}>URL</Tab>
                    <Tab transition="all 0.2s" _hover={{ transform: 'translateY(-1px)' }}>Code</Tab>
                    <Tab transition="all 0.2s" _hover={{ transform: 'translateY(-1px)' }}>Text</Tab>
                    <Tab transition="all 0.2s" _hover={{ transform: 'translateY(-1px)' }}>
                      <StarIcon color="yellow.400" mr={2} />
                      Favorites
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory.filter(item => item.type === 'url')}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory.filter(item => item.type === 'code')}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory.filter(item => item.type === 'text')}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory.filter(item => item.isFavorite)}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </Box>

          {/* Right Section - Enhanced Input Area */}
          <Box flex={{ base: '1 1 100%', md: '1 0 0' }} minW="0" w="100%" display={{ base: 'none', md: 'block' }}>
            <VStack w="full" spacing={5}>
              {/* Enhanced Input Section */}
              <Box
                w="full"
                p={6}
                borderWidth={1}
                borderColor={borderColor}
                borderRadius="xl"
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: 'md' }}
              >
                <VStack spacing={4}>
                  <HStack w="full" justify="space-between" align="center">
                    <Text fontSize="md" fontWeight="semibold">
                      Add New Content
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Ctrl+Enter to add
                    </Text>
                  </HStack>
                  <Textarea
                    placeholder="Type or paste content here..."
                    value={selectedText}
                    onChange={(e) => setSelectedText(e.target.value)}
                    resize="vertical"
                    rows={4}
                    borderRadius="lg"
                    _focus={{ 
                      borderColor: "blue.400", 
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" 
                    }}
                    transition="all 0.2s"
                  />
                  <Button
                    colorScheme="blue"
                    onClick={addToClipboard}
                    isDisabled={!selectedText.trim()}
                    w="full"
                    size="lg"
                    borderRadius="lg"
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                    _active={{ transform: 'translateY(0)' }}
                  >
                    Add to Clipboard
                  </Button>
                </VStack>
              </Box>

              {selectedItem && (
                <ScaleFade initialScale={0.9} in={!!selectedItem}>
                  <Box
                    w="full"
                    p={6}
                    borderWidth={1}
                    borderColor={borderColor}
                    borderRadius="xl"
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow="sm"
                  >
                    <VStack spacing={4}>
                      <HStack w="full" justify="space-between" align="center">
                        <Text fontSize="md" fontWeight="semibold">Edit Item</Text>
                        <Badge colorScheme="blue" variant="subtle">
                          {selectedItem.type}
                        </Badge>
                      </HStack>
                      <Divider />
                      <Textarea
                        value={selectedItem.content}
                        onChange={(e) => {
                          const updatedContent = e.target.value;
                          if (selectedItem) {
                            setClipboardHistory(prev =>
                              prev.map(item =>
                                item.id === selectedItem.id
                                  ? { ...item, content: updatedContent }
                                  : item
                              )
                            );
                          }
                        }}
                        minH="300px"
                        borderRadius="lg"
                        _focus={{ 
                          borderColor: "blue.400", 
                          boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" 
                        }}
                      />
                    </VStack>
                  </Box>
                </ScaleFade>
              )}
            </VStack>
          </Box>
        </HStack>
      </VStack>
      </Container>
    </Box>
  );
}

const ClipboardList = React.memo<ClipboardListProps>(function ClipboardList({ 
  items, 
  onCopy, 
  onToggleFavorite, 
  onDelete, 
  onSelectItem 
}) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const bgItem = useColorModeValue('gray.50', 'gray.700');
  const codeBg = useColorModeValue('gray.100', 'gray.800');
  const codeBorder = useColorModeValue('gray.200', 'gray.600');
  const bgHover = useColorModeValue('blue.50', 'blue.900');
  const borderHover = useColorModeValue('blue.200', 'blue.600');
  const fadeMask = useColorModeValue(
    'linear-gradient(transparent 0%, white 90%)',
    'linear-gradient(transparent 0%, var(--chakra-colors-gray-700) 90%)'
  );

  const toggleExpand = React.useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  if (items.length === 0) {
    return (
      <VStack py={12} spacing={4}>
        <Text fontSize="lg" color="gray.400">
          📋
        </Text>
        <Text color="gray.500" textAlign="center">
          No items found
        </Text>
        <Text fontSize="sm" color="gray.400" textAlign="center">
          Start by adding some content to your clipboard
        </Text>
      </VStack>
    );
  }

  return (
    <List spacing={4}>
      {items.map((item, index) => {
        const isExpanded = expandedItems.has(item.id);
        const shouldTruncate = item.content.length > 150 && !isExpanded;

        return (
          <ScaleFade key={item.id} initialScale={0.9} in={true} delay={index * 0.05}>
            <ListItem 
              p={5}
              borderWidth={1}
              borderRadius="xl"
              bg={bgItem}
              borderColor="transparent"
              _hover={{ 
                bg: bgHover,
                borderColor: borderHover,
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              cursor="pointer"
              onClick={() => onSelectItem(item.id)}
              position="relative"
              transition="all 0.2s ease-in-out"
            >
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between" align="start">
                <HStack spacing={3}>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    {item.timestamp.toLocaleString()}
                  </Text>
                  <Badge 
                    colorScheme={item.type === 'code' ? 'purple' : item.type === 'url' ? 'green' : 'blue'}
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {item.type}
                  </Badge>
                  {item.language && (
                    <Badge colorScheme="gray" variant="outline" borderRadius="full" fontSize="xs">
                      {item.language}
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={1} opacity={0.7} _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
                  <Tooltip label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                    <IconButton
                      aria-label="Toggle favorite"
                      icon={<StarIcon />}
                      size="sm"
                      variant="ghost"
                      color={item.isFavorite ? 'yellow.400' : 'gray.400'}
                      _hover={{ 
                        color: 'yellow.400', 
                        transform: 'scale(1.1)',
                        bg: 'yellow.50'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                  <Tooltip label="Copy to clipboard">
                    <IconButton
                      aria-label="Copy to clipboard"
                      icon={<CopyIcon />}
                      size="sm"
                      variant="ghost"
                      _hover={{ 
                        color: 'blue.500', 
                        transform: 'scale(1.1)',
                        bg: 'blue.50'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(item.content);
                      }}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                  <Tooltip label="Delete item">
                    <IconButton
                      aria-label="Delete item"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      _hover={{ 
                        color: 'red.500', 
                        transform: 'scale(1.1)',
                        bg: 'red.50'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                </HStack>
              </HStack>
              <Box position="relative">
                {item.type === 'code' ? (
                  <Box position="relative">
                    <Code
                      w="full"
                      p={4}
                      borderRadius="lg"
                      display="block"
                      whiteSpace="pre"
                      overflowX="hidden"
                      bg={codeBg}
                      borderColor={codeBorder}
                      borderWidth={1}
                      fontSize="sm"
                      fontFamily="'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', monospace"
                      maxHeight={shouldTruncate ? "120px" : "none"}
                      overflowY={shouldTruncate ? "hidden" : "auto"}
                      css={shouldTruncate ? {
                        maskImage: fadeMask,
                        WebkitMaskImage: fadeMask
                      } : undefined}
                      position="relative"
                      _before={{
                        content: `"${item.language || 'code'}"`,
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        fontSize: 'xs',
                        color: 'gray.500',
                        bg: useColorModeValue('white', 'gray.700'),
                        px: 2,
                        py: 1,
                        borderRadius: 'md',
                        fontWeight: 'medium'
                      }}
                    >
                      {item.content}
                    </Code>
                    {shouldTruncate && (
                      <Button
                        size="sm"
                        variant="solid"
                        colorScheme="blue"
                        position="absolute"
                        bottom="2"
                        right="2"
                        zIndex={2}
                        fontSize="xs"
                        px={3}
                        py={1}
                        h="auto"
                        onClick={(e) => toggleExpand(item.id, e)}
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      >
                        {isExpanded ? 'Show less' : 'View more'}
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box position="relative">
                    <Text
                      fontSize="sm"
                      noOfLines={shouldTruncate ? 3 : undefined}
                      position="relative"
                      css={shouldTruncate ? {
                        maskImage: fadeMask,
                        WebkitMaskImage: fadeMask
                      } : undefined}
                    >
                      {item.content}
                    </Text>
                    {shouldTruncate && (
                      <Button
                        size="sm"
                        variant="solid"
                        colorScheme="blue"
                        position="absolute"
                        bottom="1"
                        right="1"
                        zIndex={2}
                        fontSize="xs"
                        px={3}
                        py={1}
                        h="auto"
                        onClick={(e) => toggleExpand(item.id, e)}
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      >
                        {isExpanded ? 'Show less' : 'View more'}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </VStack>
          </ListItem>
          </ScaleFade>
        );
      })}
    </List>
  );
});

export default App;
